-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bucket_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "target_date" DATETIME,
    "cover_image" BLOB,
    "cover_mime" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bucket_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "item_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "mime_type" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "item_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bucket_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "item_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "link_type" TEXT NOT NULL DEFAULT 'OTHER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "item_links_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bucket_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
