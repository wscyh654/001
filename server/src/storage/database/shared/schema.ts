import { pgTable, serial, timestamp, varchar, integer, text, boolean, decimal, index, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  openid: varchar("openid", { length: 128 }).notNull().unique(),
  nickname: varchar("nickname", { length: 128 }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("users_openid_idx").on(table.openid),
]);

export const dishes = pgTable("dishes", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  cuisineType: varchar("cuisine_type", { length: 50 }),
  cookingMethod: varchar("cooking_method", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  images: jsonb("images"),
  description: text("description"),
  stock: integer("stock").default(999),
  spiciness: varchar("spiciness", { length: 20 }).default("none"),
  temperature: varchar("temperature", { length: 20 }).default("normal"),
  specifications: jsonb("specifications"),
  isNew: boolean("is_new").default(false),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("dishes_category_idx").on(table.category),
  index("dishes_cuisine_type_idx").on(table.cuisineType),
  index("dishes_cooking_method_idx").on(table.cookingMethod),
  index("dishes_is_new_idx").on(table.isNew),
  index("dishes_is_available_idx").on(table.isAvailable),
]);

export const dishSpecs = pgTable("dish_specs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  options: jsonb("options").notNull(),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("dish_specs_dish_id_idx").on(table.dishId),
]);

export const wishDishes = pgTable("wish_dishes", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  dishName: varchar("dish_name", { length: 128 }).notNull(),
  description: text("description"),
  image: text("image"),
  voteCount: integer("vote_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("wish_dishes_user_id_idx").on(table.userId),
  index("wish_dishes_is_active_idx").on(table.isActive),
  index("wish_dishes_vote_count_idx").on(table.voteCount),
]);

export const wishVotes = pgTable("wish_votes", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  wishId: varchar("wish_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("wish_votes_wish_id_idx").on(table.wishId),
  index("wish_votes_user_id_idx").on(table.userId),
]);

export const reservations = pgTable("reservations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  reservationTime: timestamp("reservation_time", { withTimezone: true }).notNull(),
  contactName: varchar("contact_name", { length: 128 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  personCount: integer("person_count").notNull(),
  note: text("note"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("reservations_user_id_idx").on(table.userId),
  index("reservations_status_idx").on(table.status),
  index("reservations_reservation_time_idx").on(table.reservationTime),
]);

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }),
  tableNumber: integer("table_number"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("orders_user_id_idx").on(table.userId),
  index("orders_table_number_idx").on(table.tableNumber),
  index("orders_status_idx").on(table.status),
  index("orders_created_at_idx").on(table.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: varchar("order_id", { length: 36 }).notNull(),
  dishId: varchar("dish_id", { length: 36 }).notNull(),
  dishName: varchar("dish_name", { length: 128 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  specs: jsonb("specs"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
  index("order_items_dish_id_idx").on(table.dishId),
]);

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("messages_user_id_idx").on(table.userId),
  index("messages_created_at_idx").on(table.createdAt),
]);

export const carts = pgTable("carts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  dishId: varchar("dish_id", { length: 36 }).notNull(),
  dishName: varchar("dish_name", { length: 128 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  specs: jsonb("specs"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("carts_user_id_idx").on(table.userId),
  index("carts_dish_id_idx").on(table.dishId),
]);
