# Image Color Remover app — English copy and Chinese review

Status: **local draft only; not deployed.**

This review covers the public landing page and the signed-in photo-cleanup workspace. The AI-edit request, credit reservation/refund, and download result flow are now implemented locally. It remains **not deployed**: the production provider key and production payment/credit settings still need to be configured and verified before release.

## 1. Public landing page

| English                                                                                                                                                                                             | 中文审阅稿                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AI photo cleanup                                                                                                                                                                                    | AI 照片清理                                                                                            |
| Remove the person. Keep the moment.                                                                                                                                                                 | 移除多余人物，保留珍贵瞬间。                                                                           |
| Select an unwanted person or small distraction in a photo. AI rebuilds the marked area, while your source image stays separate from the downloaded result.                                          | 圈选照片中不需要的人物或小型干扰物。AI 会重建标记区域，原图始终独立保留，结果会另存下载。              |
| Start an edit                                                                                                                                                                                       | 开始编辑                                                                                               |
| Create an account                                                                                                                                                                                   | 创建账户                                                                                               |
| Sign in is required before an AI edit so credits, cost controls, and edit history stay protected.                                                                                                   | 执行 AI 编辑前需要登录，以保护积分、费用控制和编辑记录。                                               |
| Select the unwanted area · Review the result · Download a new image                                                                                                                                 | 圈选不需要的区域 · 检查结果 · 下载新图片                                                               |
| A deliberate selection                                                                                                                                                                              | 更准确的圈选                                                                                           |
| Paint only the person or object that should disappear. A tight selection helps AI preserve the rest of the photo.                                                                                   | 只涂抹需要移除的人物或物体。选区贴合，AI 就能更好地保留照片其余部分。                                  |
| Credits before compute                                                                                                                                                                              | 先看积分，再开始计算                                                                                   |
| Your balance and the cost of an edit are shown before AI processing begins. Uploading and selecting are never charged.                                                                              | AI 处理开始前会显示余额和本次编辑成本。上传和圈选不会收费。                                            |
| Original stays yours                                                                                                                                                                                | 原图始终归你所有                                                                                       |
| Every result is a separate download. Keep your original and retry with a more precise selection whenever needed.                                                                                    | 每次结果都会作为单独文件下载。你可以保留原图，并随时调整更精确的选区后重试。                           |
| Built for careful edits                                                                                                                                                                             | 为谨慎编辑而设计                                                                                       |
| Useful cleanup, clear boundaries.                                                                                                                                                                   | 实用清理，也有清晰边界。                                                                               |
| This workspace is for removing people, photobombers, and small distractions from images you have permission to edit. It is not a tool for removing watermarks, copyright notices, or safety labels. | 本工作台用于移除你有权编辑的图片中的人物、乱入者或小型干扰物；不支持去除水印、版权声明或安全标签。     |
| Your image is sent to the AI editing provider only after you intentionally start an edit. We do not create an image library or overwrite your source file.                                          | 只有在你主动开始编辑后，图片才会发送给 AI 图像编辑服务商。我们不会建立你的图片库，也不会覆盖你的原图。 |

## 2. Account gate

| English                                                                                                                                             | 中文审阅稿                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Member workspace                                                                                                                                    | 会员工作台                                                               |
| Sign in before starting an AI edit.                                                                                                                 | 开始 AI 编辑前请先登录。                                                 |
| An account keeps your credits, processing limits, and edit history protected. It also prevents anonymous requests from spending the service budget. | 账户用于保护你的积分、处理限额和编辑记录，也能阻止匿名请求消耗服务预算。 |
| Sign in to continue                                                                                                                                 | 登录并继续                                                               |

## 3. Signed-in workspace

| English                                                                                                                                             | 中文审阅稿                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Remove an unwanted person                                                                                                                           | 移除不需要的人物                                                                                |
| Upload a photo, paint the unwanted person, review the AI result, then download a separate image.                                                    | 上传照片，涂抹不需要的人物，检查 AI 结果，再下载一张独立的新图片。                              |
| Step 1 · select the person                                                                                                                          | 第 1 步 · 圈选人物                                                                              |
| Drop in a photo to begin                                                                                                                            | 拖入照片，即可开始                                                                              |
| Choose a JPG, PNG, or WebP under 10 MB. You can also drag it here. Review your red selection before starting the AI edit.                           | 支持 10MB 以内的 JPG、PNG 或 WebP，也可以直接拖到这里。开始 AI 处理前，请检查红色选区是否准确。 |
| Choose a photo                                                                                                                                      | 选择照片                                                                                        |
| Paint the person to remove                                                                                                                          | 涂抹要移除的人物                                                                                |
| Use a close red selection around the unwanted person. Include hair and clothing, but avoid painting the background unless it belongs to the person. | 用红色选区贴合涂抹不需要的人物。头发和衣物也要覆盖；除非背景属于这个人，否则不要涂到背景。      |
| Brush size                                                                                                                                          | 画笔大小                                                                                        |
| Clear selection                                                                                                                                     | 清除选区                                                                                        |
| Remove selected person                                                                                                                              | 移除已圈选人物                                                                                  |
| Removing with AI…                                                                                                                                   | 正在使用 AI 移除…                                                                               |
| This edit uses 1 credit only after the AI request begins. Failed provider requests are refunded automatically.                                      | AI 请求真正开始后才会使用 1 积分；服务商处理失败会自动退回积分。                                |
| For privacy, this version does not keep an online copy of your source image or result. Download the result when it is ready.                        | 为保护隐私，此版本不会在线保留原图或结果图。处理完成后请自行下载结果。                          |
| Step 2 · result                                                                                                                                     | 第 2 步 · 结果                                                                                  |
| Your edited image                                                                                                                                   | 编辑后的图片                                                                                    |
| Your original was not overwritten. Download this separate image, or refine the selection and try again.                                             | 原图没有被覆盖。你可以下载这张单独生成的图片，或调整选区后重新处理。                            |
| Download image                                                                                                                                      | 下载图片                                                                                        |
| Choose another photo                                                                                                                                | 换一张照片                                                                                      |

## What I will connect before release

1. Configure the provider key only as a production secret; it is never exposed to the browser.
2. Set the live credit price and initial balance, then make one non-personal test edit to verify deduction and automatic failure refund.
3. Keep the first release privacy-first: no online photo library or output retention. Add R2 only when users need edit history, with an explicit retention/deletion policy.
4. Final English/Chinese copy check, then your explicit approval before deploying.
