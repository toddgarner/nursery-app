/*
  Warnings:

  - Added the required column `parent` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrant" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "parent" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" DATETIME NOT NULL,
    "medical" TEXT NOT NULL,
    "qrcode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("age", "createdAt", "dob", "email", "id", "medical", "phone", "qrcode", "registrant", "status", "updatedAt", "userId") SELECT "age", "createdAt", "dob", "email", "id", "medical", "phone", "qrcode", "registrant", "status", "updatedAt", "userId" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
