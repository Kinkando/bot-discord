import { ObjectId } from "mongodb";

export enum BatchProgressStatus {
    Waiting = 1, // Task is waiting to be processed
    Processing = 2, // Task is currently being processed
    Finished = 3, // Task has been completed
}

export enum BatchProgressSpeedType {
    Fast = 2, // Use Credit
    Normal = 3, // Free
}

export interface APIConfig {
    readonly headers: Map;
}

export enum StatusCode {
    Success = 10000,
}

interface Map {
    [key: string]: string;
}

export interface ImageGenerationPreset extends TextToImageRequest {
    _id: ObjectId; // Unique identifier for the preset
    is_default: boolean; // Indicates if this preset is the default one
    note: string; // Description or note about the preset
    name: string; // Name of the preset
}

export interface TextToImageRequest {
    model_no: string;
    model_ver_no: string;
    channel_id: string;
    speed_type: BatchProgressSpeedType;
    meta: {
        prompt: string; // The main text prompt for the image generation
        negative_prompt: string;
        width: number;
        height: number;
        steps: number;
        cfg_scale: number;
        sampler_name: string;
        n_iter: number; // Number of iterations to generate images [1-4]
        lora_models?: Array<{
            model_id: string;
            weight: number;
            model_ver_no: string;
            base_model?: string;
        }>;
        vae?: string | null;
        clip_skip?: number;
        seed?: number | null; // Random seed for unique image generation seed
        restore_faces?: boolean | null;
        embeddings?: Array<string>;
        generate?: {
            anime_enhance?: number | null;
            mode?: number | null;
            gen_mode?: number | null;
            prompt_magic_mode?: number | null;
        };
    };
}

export interface TextToImageResponse {
    data: {
        id: string;
        prompt: string;
        local_prompt: string;
        type: number;
        sub_type: number;
        sub_mode_category: number;
        width: number;
        height: number;
        ckpts: Array<Model>;
        loras: Array<Model>;
        embeddings?: Array<string>;
        create_at?: number | null;
    };
    status: StatusResponse;
}

export interface BatchProgressRequest {
    task_ids: Array<string>;
}

export interface BatchProgressResponse {
    data: {
        items: Array<{
            task_id: string;
            type: number;
            sub_type: number;
            task_domain_type: number;
            process: number;
            img_url: string;
            banner?: Banner | null;
            status: BatchProgressStatus;
            status_desc: string;
            sub_status: number;
            pub_artwork_no: string;
            pub_artwork_nos: Array<string>;
            nsfw: number;
            img_uris: Array<{
                id: string;
                width: number;
                height: number;
                cover_url: string;
                title: string;
                is_blur: boolean;
                url: string;
                nsfw: number;
                is_nsfw_plus: boolean;
                index: number;
                artwork_no?: string | null;
                expiration_time?: number | null;
                is_submit?: boolean | null;
                is_saved_personal?: boolean | null;
                rembg_x?: number | null;
                rembg_y?: number | null;
                node_key?: string | null;
                type?: number | null;
                sub_type?: number | null;
                operation_labels?: Array<string>;
                action_capability?: {
                    basic?: Array<{ val: string }>;
                    hover?: Array<{ val: string; creativity_template_id?: string }>;
                    edit?: Array<{ val: string; creativity_template_id?: string }>;
                    extend?: Array<{ val: string }>;
                    permission?: any;
                };
                is_nsfw_appeal?: boolean | null;
            }>;
            category: number;
            deduction_detail: {
                is_chargeable: boolean;
                hashrate: number;
                temp_hashrate: number;
                history_hashrate: boolean;
                after_hashrate?: number | null;
                after_temp_hashrate?: number | null;
                refund_hashrate?: number | null;
                refund_temp_hashrate?: number | null;
                daily_task_count?: number | null;
            };
            pub_community: number;
            expiration_time?: number | null;
            create_at?: number | null;
            speed_type?: number | null;
            reason?: number | null;
            total_num?: number | null;
            current_num?: number | null;
            task_return?: {
                sub_status: number;
                used: number;
                hashrate: number;
                temp_hashrate: number;
                free_num: number;
                remain_num: number;
            };
        }>;
    };
    status: StatusResponse;
}

interface StatusResponse {
    code: StatusCode;
    msg: string;
    request_id?: string;
}

interface Banner {
    width: number;
    height: number;
    url: string;
    nsfw: number;
    is_nsfw_plus: boolean;
    green: number;
    has_meta: number;
    stream_url?: string;
    cover_url?: string;
}

interface Model {
    id: string;
    banner: Banner;
    name: string;
    model_no: string;
    model_ver_no: string;
    version_name: string;
    model_type: string;
    base_model_name?: string | null;
    weight?: number | null;
    tags?: Array<string>;
    trained_words?: Array<string> | null;
}
