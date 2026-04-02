# 点餐小程序上线部署指南

## 📋 部署总览

```
步骤1: 创建 Supabase 数据库
步骤2: 部署后端到 Railway
步骤3: 配置微信小程序服务器域名
步骤4: 构建并上传小程序代码
步骤5: 提交审核发布
```

---

## 步骤1: 创建 Supabase 数据库

### 1.1 注册 Supabase
1. 访问 https://supabase.com
2. 点击 "Start your project" 注册账号（可用 GitHub 登录）
3. 创建一个新组织（Organization）

### 1.2 创建项目
1. 点击 "New Project"
2. 填写项目名称，如 `ordering-system`
3. 设置数据库密码（记住这个密码！）
4. 选择离你最近的区域
5. 点击 "Create new project" 等待创建完成

### 1.3 获取连接信息
1. 进入项目后，点击左侧 "Settings" → "API"
2. 复制以下信息保存好：
   - **Project URL** → 这就是 `COZE_SUPABASE_URL`
   - **anon public key** → 这就是 `COZE_SUPABASE_ANON_KEY`

### 1.4 创建数据库表
在 Supabase 左侧点击 "SQL Editor"，然后点击 "New query"，粘贴以下 SQL 并执行：

```sql
-- 菜品表
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  category VARCHAR(50),
  cuisine VARCHAR(50),
  cooking_method VARCHAR(50),
  spice_level INTEGER DEFAULT 0,
  temperature VARCHAR(20),
  spec_name VARCHAR(50),
  spec_options JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 菜品规格表
CREATE TABLE dish_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID REFERENCES dishes(id),
  name VARCHAR(50) NOT NULL,
  options JSONB NOT NULL
);

-- 购物车表
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  dish_id UUID REFERENCES dishes(id),
  dish_name VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  note TEXT,
  spec_value VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  table_number INTEGER,
  total_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单明细表
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  dish_name VARCHAR(100),
  quantity INTEGER,
  price DECIMAL(10,2),
  spec_value VARCHAR(100)
);

-- 留言表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 心愿菜品表
CREATE TABLE wish_dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  dish_name VARCHAR(100) NOT NULL,
  description TEXT,
  image TEXT,
  vote_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 心愿投票表
CREATE TABLE wish_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID REFERENCES wish_dishes(id),
  user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wish_id, user_id)
);

-- 轮播图表
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(100) UNIQUE,
  nickname VARCHAR(100),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 步骤2: 部署后端到 Railway

### 2.1 注册 Railway
1. 访问 https://railway.app
2. 点击 "Start a New Project" 用 GitHub 登录
3. 授权 Railway 访问你的 GitHub

### 2.2 创建项目
1. 点击 "+ New Project"
2. 选择 "Deploy from GitHub repo"
3. 如果没有仓库，先在 GitHub 创建一个仓库并推送代码

### 2.3 推送代码到 GitHub
```bash
# 在本地项目目录执行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2.4 配置环境变量
在 Railway 项目中：
1. 点击 "Variables" 标签
2. 添加以下变量：
   - `COZE_SUPABASE_URL` = 你的 Supabase URL
   - `COZE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
   - `PORT` = 3000

### 2.5 生成域名
1. 点击 "Settings" 标签
2. 点击 "Generate Domain"
3. 你会获得一个类似 `xxx.railway.app` 的域名
4. 保存这个域名，后面要用

---

## 步骤3: 配置微信小程序服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 左侧菜单 → "开发管理" → "开发设置"
3. 找到 "服务器域名"
4. 点击 "修改"，添加以下域名：

| 类型 | 域名 |
|------|------|
| request 合法域名 | `https://你的railway域名.railway.app` |
| uploadFile 合法域名 | `https://你的railway域名.railway.app` |

📌 **注意**：域名必须以 `https://` 开头

---

## 步骤4: 构建并上传小程序代码

### 4.1 更新前端域名配置
在后端部署完成后，需要更新前端代码中的 API 地址。

### 4.2 构建小程序
```bash
# 在项目根目录执行
pnpm build:weapp
```

### 4.3 使用微信开发者工具上传
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具，导入项目
3. 选择项目根目录下的 `dist` 文件夹
4. 填写 AppID: `wxc522257277b8e2fc`
5. 点击右上角 "上传" 按钮
6. 填写版本号（如 1.0.0）和备注

---

## 步骤5: 提交审核发布

1. 登录微信公众平台
2. 左侧菜单 → "管理" → "版本管理"
3. 找到刚上传的版本，点击 "提交审核"
4. 填写审核信息：
   - 选择服务类目（餐饮 > 点餐）
   - 上传截图
   - 填写测试账号（如需要）
5. 等待审核（通常 1-3 天）
6. 审核通过后点击 "发布" 即可上线

---

## 🎉 完成！

小程序上线后，用户扫码即可使用你的点餐系统。

---

## 📞 遇到问题？

如果在部署过程中遇到问题，请告诉我具体在哪一步，我来帮你解决。
