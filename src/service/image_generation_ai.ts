import axios, { HttpStatusCode } from "axios";
import { ImageGenerationAIRepository } from "../repository/image_generation_ai";
import { BatchProgressRequest, BatchProgressResponse, BatchProgressStatus, ImageGenerationPreset, StatusCode, TextToImageRequest, TextToImageResponse } from "../types/image_generation_ai";
import { config } from "../../config/config";

export interface Service {
    getPresets(): Promise<ImageGenerationPreset[]>;
    generateImage(prompt: string, req: TextToImageRequest): Promise<string[]>;
}

export class ImageGenerationAIService implements Service {
    constructor(private readonly repository: ImageGenerationAIRepository) {}

    async getPresets(): Promise<ImageGenerationPreset[]> {
        return await this.repository.getPresets();
    }

    async generateImage(prompt: string, req: TextToImageRequest): Promise<string[]> {
        const { headers } = await this.repository.getConfig();

        req.meta.prompt = prompt;
        req.meta.seed = new Date().getTime()/1000; // Use current timestamp as seed for uniqueness
        const { data } = await axios.request<TextToImageResponse>({
            method: 'POST',
            baseURL: config.imageGenerationAI.baseURL,
            url: '/v1/task/v2/text-to-img',
            data: req,
            headers,
        });
        const taskID = data.data.id;

        return await new Promise(async (resolve, reject) => {
            const interval = setInterval(async () => {
                const req: BatchProgressRequest = {
                    task_ids: [taskID],
                };
                try {
                    const { data, status } = await axios.request<BatchProgressResponse>({
                        method: 'POST',
                        baseURL: config.imageGenerationAI.baseURL,
                        url: '/v1/task/batch-progress',
                        data: req,
                        headers,
                    });

                    if (status !== HttpStatusCode.Ok || data.status.code !== StatusCode.Success) {
                        throw new Error(`Error fetching batch progress: ${data.status.msg}`);
                    }

                    let isFinished = false;
                    const imageUrls: string[] = [];
                    for (const item of data.data.items) {
                        if (item.status === BatchProgressStatus.Finished && item.img_uris.length > 0) {
                            imageUrls.push(...item.img_uris.map(({ url }) => url));
                            isFinished = true;
                            continue
                        }
                        isFinished = false;
                        break;
                    }
                    if (isFinished) {
                        clearInterval(interval);
                        resolve(imageUrls);
                        return;
                    }

                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 2000);
        });
    }
}