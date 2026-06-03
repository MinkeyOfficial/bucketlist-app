-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checklist_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bucket_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
