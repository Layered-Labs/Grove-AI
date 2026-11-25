// What is actually running, stated plainly. Values come from the model's
// Hugging Face page and from WebLLM's own configuration for this build.
export const MODEL_INFO = {
  tag: 'qwen2.5:0.5b-instruct-q4f16_1',
  name: 'Qwen2.5 0.5B Instruct',
  maker: 'Alibaba Cloud (Qwen team)',
  parameters: '0.5B',
  quantization: 'q4f16_1 (4-bit weights)',
  context: '4,096 tokens',
  memory: 'about 945 MB of GPU memory',
  license: 'Apache 2.0',
  runtime: 'WebLLM, on WebGPU',
  source: 'https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
} as const
