export enum LLMModelEnum {
  OPENAI = "openai",
  GEMINI = "gemini",
}

export type ReqLLMChat = {
  system_prompt: string;
  assistant_prompt?: string;
  user_prompt: string;
  temperature?: number;
  model: string;
  stream?: boolean;
  llm_type: LLMModelEnum;
};

export type ResLLMChat = {
  message: string;
};

export type ResLLMModelList = {
  models: Record<
    LLMModelEnum,
    {
      version: string;
      deployment_id: string;
      model: string;
    }[]
  >;
};
