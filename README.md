# Digital Twin Editor

基于 Web 的三维数字孪生场景编辑器，支持模型上传管理、3D 场景搭建、对象属性编辑和场景快照版本管理。

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.4 | 渐进式 JavaScript 框架 |
| TypeScript | ^5.4 | 类型安全 |
| Vite | ^5.2 | 构建工具 |
| Three.js | ^0.170 | 3D 渲染引擎 |
| Pinia | ^2.1 | 状态管理 |
| Vue Router | ^4.3 | 路由管理 |
| Element Plus | ^2.7 | UI 组件库 |
| Axios | ^1.6 | HTTP 客户端 |
| Lucide Vue | ^0.378 | 图标库 |
| Sass | ^1.77 | CSS 预处理器 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 开发语言 |
| Spring Boot | 3.2.5 | 应用框架 |
| Spring Security | - | 认证与授权 |
| MyBatis Plus | 3.5.5 | ORM 框架 |
| MySQL | 8.0+ | 关系型数据库 |
| Redis | - | 缓存 |
| MinIO | - | 对象存储 |
| JWT (jjwt) | 0.12.3 | Token 认证 |
| Lombok | - | 代码简化 |

## 项目结构

```
digital-twin-editor/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/digitaltwin/
│       │   ├── DigitalTwinApplication.java      # 启动类
│       │   ├── common/                          # 公共模块
│       │   │   ├── BusinessException.java       # 业务异常
│       │   │   ├── GlobalExceptionHandler.java  # 全局异常处理
│       │   │   ├── PageResult.java              # 分页结果
│       │   │   └── Result.java                  # 统一响应
│       │   ├── config/                          # 配置类
│       │   │   ├── CorsConfig.java              # 跨域配置
│       │   │   ├── MinioConfig.java             # MinIO 配置
│       │   │   └── SecurityConfig.java          # 安全配置
│       │   ├── controller/                      # 控制器
│       │   │   ├── AuthController.java          # 认证接口
│       │   │   ├── ModelController.java         # 模型管理接口
│       │   │   └── SceneController.java         # 场景管理接口
│       │   ├── dto/                             # 数据传输对象
│       │   │   ├── LoginDTO.java
│       │   │   ├── RegisterDTO.java
│       │   │   ├── ModelDTO.java
│       │   │   ├── SceneDTO.java
│       │   │   ├── SceneDetailVO.java
│       │   │   ├── SceneObjectCreateDTO.java
│       │   │   ├── SceneObjectVO.java
│       │   │   ├── SceneSaveDTO.java
│       │   │   └── UserInfoVO.java
│       │   ├── entity/                          # 实体类
│       │   │   ├── User.java
│       │   │   ├── ModelAsset.java
│       │   │   ├── Scene.java
│       │   │   ├── SceneObject.java
│       │   │   └── SceneSnapshot.java
│       │   ├── mapper/                          # MyBatis Mapper
│       │   │   ├── UserMapper.java
│       │   │   ├── ModelAssetMapper.java
│       │   │   ├── SceneMapper.java
│       │   │   ├── SceneObjectMapper.java
│       │   │   └── SceneSnapshotMapper.java
│       │   ├── security/                        # 安全模块
│       │   │   ├── JwtTokenProvider.java        # JWT 工具
│       │   │   └── JwtAuthenticationFilter.java # JWT 过滤器
│       │   └── service/                         # 业务逻辑
│       │       ├── AuthService.java
│       │       ├── FileStorageService.java
│       │       ├── ModelService.java
│       │       ├── SceneService.java
│       │       ├── SceneObjectService.java
│       │       └── impl/
│       │           ├── AuthServiceImpl.java
│       │           ├── MinioFileStorageServiceImpl.java
│       │           ├── ModelServiceImpl.java
│       │           ├── SceneServiceImpl.java
│       │           └── SceneObjectServiceImpl.java
│       └── resources/
│           ├── application.yml                  # 应用配置
│           └── db/
│               └── init.sql                     # 数据库初始化脚本
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── main.ts                              # 入口文件
        ├── App.vue                              # 根组件
        ├── env.d.ts                             # 类型声明
        ├── api/                                 # API 接口
        │   ├── index.ts                         # Axios 实例
        │   ├── auth.ts                          # 认证 API
        │   ├── model.ts                         # 模型 API
        │   └── scene.ts                         # 场景 API
        ├── components/editor/                   # 编辑器组件
        │   ├── EditorToolbar.vue                # 工具栏
        │   ├── ModelLibraryPanel.vue            # 模型库面板
        │   ├── PropertiesPanel.vue              # 属性面板
        │   ├── SceneOutline.vue                 # 场景大纲
        │   └── Viewport3D.vue                   # 3D 视口
        ├── composables/                         # 组合式函数
        │   ├── useDragDrop.ts                   # 拖拽功能
        │   ├── useModelLoader.ts                # 模型加载
        │   ├── useRaycaster.ts                  # 射线拾取
        │   ├── useThreeScene.ts                 # Three.js 场景
        │   └── useTransformControls.ts          # 变换控制器
        ├── router/
        │   └── index.ts                         # 路由配置
        ├── stores/                              # Pinia 状态
        │   ├── userStore.ts                     # 用户状态
        │   ├── modelStore.ts                    # 模型状态
        │   └── editorStore.ts                   # 编辑器状态
        ├── styles/
        │   ├── variables.scss                   # 样式变量
        │   └── global.scss                      # 全局样式
        ├── types/                               # TypeScript 类型
        │   ├── index.ts
        │   ├── api.ts
        │   ├── model.ts
        │   └── scene.ts
        ├── utils/
        │   └── request.ts                       # 请求封装
        └── views/                               # 页面视图
            ├── LoginView.vue                    # 登录页
            ├── ScenesView.vue                   # 场景列表页
            ├── ModelsView.vue                   # 模型管理页
            └── EditorView.vue                   # 场景编辑器页
```

## 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | 前端运行环境 |
| Java | 17+ | 后端运行环境 |
| Maven | 3.8+ | 后端构建工具 |
| MySQL | 8.0+ | 数据库 |
| Redis | 6.0+ | 缓存服务 |
| MinIO | 最新版 | 对象存储服务 |

## 快速启动

### 1. 初始化数据库

```bash
# 登录 MySQL，创建数据库
mysql -u root -p
```

```sql
CREATE DATABASE digital_twin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_twin;
SOURCE /path/to/digital-twin-editor/backend/src/main/resources/db/init.sql;
```

### 2. 启动 MinIO

```bash
# 使用 Docker 启动 MinIO
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# 访问 MinIO 控制台 http://localhost:9001
# 创建名为 digital-twin 的存储桶，并设置访问策略为公开读取
```

### 3. 启动后端

```bash
cd backend

# 配置数据库密码（如需修改）
export MYSQL_PASSWORD=your_password

# 启动服务
mvn spring-boot:run
```

后端服务默认运行在 `http://localhost:8080`。

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认运行在 `http://localhost:3000`。

### 5. 访问应用

打开浏览器访问 `http://localhost:3000`，使用默认管理员账号登录：

- **用户名**: `admin`
- **密码**: `admin123`

## API 接口列表

### 认证接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login` | 用户登录 | 否 |
| POST | `/api/auth/register` | 用户注册 | 否 |
| GET | `/api/auth/userinfo` | 获取当前用户信息 | 是 |

### 模型管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/models/upload` | 上传模型文件 | 是 |
| GET | `/api/models/list` | 分页查询模型列表 | 是 |
| GET | `/api/models/{id}` | 获取模型详情 | 是 |
| DELETE | `/api/models/{id}` | 删除模型 | 是 |
| GET | `/api/models/{id}/file` | 获取模型文件（302 重定向） | 是 |
| GET | `/api/models/{id}/thumbnail` | 获取模型缩略图 | 是 |

### 场景管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/scenes/list` | 分页查询场景列表 | 是 |
| POST | `/api/scenes` | 创建场景 | 是 |
| GET | `/api/scenes/{id}` | 获取场景详情（含对象列表） | 是 |
| PUT | `/api/scenes/{id}` | 更新场景 | 是 |
| DELETE | `/api/scenes/{id}` | 删除场景 | 是 |

### 场景对象接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/scenes/{sceneId}/objects` | 添加场景对象 | 是 |
| PUT | `/api/scenes/{sceneId}/objects/{objectId}` | 更新场景对象 | 是 |
| DELETE | `/api/scenes/{sceneId}/objects/{objectId}` | 删除场景对象 | 是 |

## 配置说明

### 后端配置 (`backend/src/main/resources/application.yml`)

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `server.port` | 8080 | 后端服务端口 |
| `spring.datasource.url` | jdbc:mysql://localhost:3306/digital_twin | 数据库连接地址 |
| `spring.datasource.username` | root | 数据库用户名 |
| `spring.datasource.password` | ${MYSQL_PASSWORD:root} | 数据库密码（支持环境变量） |
| `spring.servlet.multipart.max-file-size` | 200MB | 单文件上传大小限制 |
| `spring.servlet.multipart.max-request-size` | 500MB | 请求总大小限制 |
| `spring.data.redis.host` | localhost | Redis 地址 |
| `spring.data.redis.port` | 6379 | Redis 端口 |
| `minio.endpoint` | http://localhost:9000 | MinIO 服务地址 |
| `minio.access-key` | ${MINIO_ACCESS_KEY:minioadmin} | MinIO Access Key |
| `minio.secret-key` | ${MINIO_SECRET_KEY:minioadmin} | MinIO Secret Key |
| `minio.bucket-name` | digital-twin | MinIO 存储桶名称 |
| `jwt.secret` | ${JWT_SECRET:digitalTwinSecretKey...} | JWT 签名密钥 |
| `jwt.expiration` | 86400000 | JWT 过期时间（毫秒，默认 24 小时） |

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MYSQL_PASSWORD` | MySQL 数据库密码 | root |
| `MINIO_ACCESS_KEY` | MinIO Access Key | minioadmin |
| `MINIO_SECRET_KEY` | MinIO Secret Key | minioadmin |
| `JWT_SECRET` | JWT 签名密钥 | digitalTwinSecretKeyForJwtTokenGeneration2024 |

### 前端配置

前端通过 Vite 代理转发 API 请求到后端服务，代理配置位于 `frontend/vite.config.ts`，默认将 `/api` 请求代理到 `http://localhost:8080`。

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `dt_user` | 用户表 |
| `dt_model_asset` | 模型资源表 |
| `dt_scene` | 场景表 |
| `dt_scene_object` | 场景对象实例表 |
| `dt_scene_snapshot` | 场景快照表 |
| `dt_scene_relation` | 对象关系表 |

详细的建表脚本请参见 `backend/src/main/resources/db/init.sql`。

## License

MIT
