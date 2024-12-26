import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 60 }).notNull(), // Assuming bcrypt hash
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('email_idx').on(table.email),
    index('username_idx').on(table.name),
  ]
);

export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('name_idx').on(table.name)]
);

export const images = pgTable(
  'images',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    publicId: varchar('public_id', { length: 255 }),
    uploadedById: integer('uploaded_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('uploaded_by_idx').on(table.uploadedById),
    index('title_idx').on(table.title),
  ]
);

export const collections = pgTable(
  'collections',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('user_id_idx').on(table.userId)]
);

export const collectionImages = pgTable(
  'collection_images',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('collection_image_idx').on(table.collectionId, table.imageId),
  ]
);

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    replyToId: integer('reply_to_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('comment_user_idx').on(table.userId),
    index('comment_image_idx').on(table.imageId),
    index('reply_to_idx').on(table.replyToId),
  ]
);

export const imageTags = pgTable(
  'image_tags',
  {
    id: serial('id').primaryKey(),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('image_tag_idx').on(table.imageId, table.tagId)]
);

export const likes = pgTable(
  'likes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('user_image_idx').on(table.userId, table.imageId)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;

export type ImageTag = typeof imageTags.$inferSelect;
export type NewImageTag = typeof imageTags.$inferInsert;

export type CollectionImage = typeof collectionImages.$inferSelect;
export type NewCollectionImage = typeof collectionImages.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
  comments: many(comments),
  likes: many(likes),
  collections: many(collections),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [images.uploadedById],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
  collections: many(collectionImages),
  tags: many(imageTags),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  images: many(collectionImages),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  image: one(images, {
    fields: [comments.imageId],
    references: [images.id],
  }),
  replyTo: one(comments, {
    fields: [comments.replyToId],
    references: [comments.id],
  }),
  replies: many(comments, { relationName: 'replies' }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  images: many(imageTags),
}));
