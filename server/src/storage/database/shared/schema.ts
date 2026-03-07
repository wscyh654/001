import { pgTable, serial, timestamp, varchar, integer, text, boolean, decimal, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const dishes = pgTable("dishes", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  description: text("description"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("dishes_category_idx").on(table.category),
  index("dishes_is_available_idx").on(table.isAvailable),
]);

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tableNumber: integer("table_number").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
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
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
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
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("messages_created_at_idx").on(table.createdAt),
]);
