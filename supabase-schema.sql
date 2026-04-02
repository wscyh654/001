-- 点餐系统数据库表结构
-- 请在 Supabase SQL Editor 中执行此脚本

-- 菜品表
CREATE TABLE IF NOT EXISTS dishes (
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
CREATE TABLE IF NOT EXISTS dish_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  options JSONB NOT NULL
);

-- 购物车表
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  dish_name VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  note TEXT,
  spec_value VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  table_number INTEGER,
  total_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  dish_name VARCHAR(100),
  quantity INTEGER,
  price DECIMAL(10,2),
  spec_value VARCHAR(100)
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 心愿菜品表
CREATE TABLE IF NOT EXISTS wish_dishes (
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
CREATE TABLE IF NOT EXISTS wish_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID REFERENCES wish_dishes(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wish_id, user_id)
);

-- 轮播图表
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(100) UNIQUE,
  nickname VARCHAR(100),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_active ON dishes(is_active);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_wish_votes ON wish_votes(wish_id, user_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（允许匿名读取）
CREATE POLICY "Allow public read" ON dishes FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON dishes FOR ALL USING (true);
CREATE POLICY "Allow public read" ON dish_specs FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON dish_specs FOR ALL USING (true);
CREATE POLICY "Allow public access" ON carts FOR ALL USING (true);
CREATE POLICY "Allow public access" ON orders FOR ALL USING (true);
CREATE POLICY "Allow public access" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow public access" ON messages FOR ALL USING (true);
CREATE POLICY "Allow public access" ON wish_dishes FOR ALL USING (true);
CREATE POLICY "Allow public access" ON wish_votes FOR ALL USING (true);
CREATE POLICY "Allow public read" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON banners FOR ALL USING (true);
CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
