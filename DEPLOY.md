# 云端部署说明

本仓库已经准备好部署到 Render。

## Render 部署步骤

1. 打开 Render Dashboard。
2. 选择 New -> Blueprint。
3. 连接 GitHub 仓库：`Gerogecook0/communication-principles-tutor`。
4. Render 会自动读取 `render.yaml`。
5. 在环境变量中填写：

```text
OPENROUTER_API_KEY=你的 OpenRouter Key
```

6. 点击 Deploy。

部署完成后，Render 会生成公网网址，例如：

```text
https://communication-principles-tutor.onrender.com
```

把这个网址发给老师或同学即可。

## 注意事项

- 不要把 API Key 写到 GitHub 文件里。
- API Key 只填在 Render 的 Environment Variables。
- Render 免费实例可能会休眠，第一次访问会慢一点。
- 若要长期稳定秒开，需要升级付费实例或使用云服务器。
