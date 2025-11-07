import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  authors: text("authors").notNull(), // JSON array or comma-separated
  location: text("location"),
  pitchDeck: text("pitch_deck"),
  estimatedResources: text("estimated_resources"),
  authorId: text("author_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const projectIdeas = sqliteTable("project_ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  authors: text("authors").notNull(), // JSON array or comma-separated
  location: text("location"),
  pitchDeck: text("pitch_deck"),
  estimatedResources: text("estimated_resources"),
  authorId: text("author_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const projectLikes = sqliteTable(
  "project_likes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueUserProject: unique().on(table.projectId, table.userId),
  })
);

export const projectSubscriptions = sqliteTable(
  "project_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueUserProject: unique().on(table.projectId, table.userId),
  })
);

export const projectFeedItems = sqliteTable("project_feed_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  likes: many(projectLikes),
  subscriptions: many(projectSubscriptions),
  feedItems: many(projectFeedItems),
}));

export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
}));

export const projectSubscriptionsRelations = relations(projectSubscriptions, ({ one }) => ({
  project: one(projects, {
    fields: [projectSubscriptions.projectId],
    references: [projects.id],
  }),
}));

export const projectFeedItemsRelations = relations(projectFeedItems, ({ one }) => ({
  project: one(projects, {
    fields: [projectFeedItems.projectId],
    references: [projects.id],
  }),
}));

