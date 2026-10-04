import 'dotenv/config'

let prompt = '鸣潮 游戏风, 心月狐'
let imgUrl = ''
let progress = '0%'

const generateImage = async () => {
  const modelName = 'doubao-seedream-5-0-flash-260915'
  const payload = {
    // 模型名称
    model: modelName,
    // 图片描述词
    prompt,
    // 宽高
    width: 1024,
    height: 1024,
    // 模型生成图像时 去噪 或 细化 图像步骤数(步骤越多质量越高 时间对应越高)
    steps: 40,
    // 提高分辨率
    prompt_upsampling: true,
    // 随机性
    seed: 42,
    // 生成图像时的 严格程度
    guidance: 3,
    // 采样器(影响 生成质量风格效率)
    sampler: 'dpmpp_2m',
    // 控制容忍度
    safety_tolerance: 2,
    response_format: "url",
    size: "2K",
    stream: false,
    watermark: true
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_KEY_IMAGE}`
  }
  

  const res = await fetch(`${process.env.OPENAI_BASE_URL_IMAGE}`, {
    headers,
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const data = await res.json()

  const resultImageInfo = {
    url: data.data[0].url,
    size: data.data[0].size,
    type: data.data[0].output_format,
    token: data.usage
  }
  
}

generateImage()