import { Db } from "mongodb"
import { APIConfig, ImageGenerationPreset } from "../types/image_generation_ai";

interface Repository {
    getPresets(): Promise<ImageGenerationPreset[]>;
    getConfig(): Promise<APIConfig>;
}

export class ImageGenerationAIRepository implements Repository {
    constructor(private db: Db) {}

    async getPresets(): Promise<ImageGenerationPreset[]> {
        return await this.db.collection<ImageGenerationPreset>('image_generation_preset').find().toArray();
    }

    async getConfig(): Promise<APIConfig> {
        return await this.db.collection<APIConfig>('image_generation_api_config').findOne({}) || {headers: {}};
    }
}
