# ALAMOS: ZWEI

本地静态项目情报站。直接打开 index.html，或运行“启动预览.cmd”。所有页面资源使用相对路径，字体随站点提供。

## 上传到自己的 GitHub 仓库

站点约 42 MiB，最大单个文件约 1.81 MiB，符合 GitHub 网页单文件 25 MiB 的限制。25 MiB 指单个文件，不是整站总大小；网页每批最多上传 100 个文件。命令行普通 Git 单文件上限为 100 MiB。无需为当前站点使用 Git LFS。

官方说明：https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

使用 GitHub Desktop 可将当前文件夹作为完整站点提交。如果使用网页上传，保持目录结构，分批上传：

1. 仓库根目录：本文件夹直接包含的 HTML、CSS、JS、说明文件，以及 .gitignore、.nojekyll；不要再额外套一层“ALMS页”。
2. assets 目录：先上传该目录直接包含的图片文件，不同时选择它的子目录，目前该批不足 100 个文件。
3. assets/web 与 assets/fonts 分别上传，保持路径层级。
4. styles 与 tools 分别上传，供以后维护和重建使用。

不要只上传 ZIP；网页需要展开后的目录。外部回退 ZIP、ALMS 原始 PNG/PSD、回收站里的历史版本都不属于上传内容。.gitignore 仅对 Git 提交生效，无法阻止网页手工拖拽上传。

仅上传仓库不等于公开网站，未来需要在自己的仓库中另行启用静态托管。本次只整理本地文件，没有连接 GitHub 或创建部署。

## 后续更新

人物和图册修改方法见“人物档案维护说明.md”。日常编辑保留 styles 源模块及 tools 工具，首页使用生成后的 site.css。

- 更换素材后：python tools/build_assets.py（需要 Pillow）。
- 修改样式后：python tools/build_styles.py。
- 上传之前：python tools/check_site.py；该工具检查缺失引用、闲置图片、总大小与超过 25 MiB 的文件，不会删除文件。

原画和回退压缩包放在站点文件夹外；站点中每张作品只保留当前需要的展示、高清和响应式版本。更新图片后同步数据与 index.html 的脚本版本，避免旧缓存。Git 自身会记录已提交历史，不必再上传带日期的整站副本。
