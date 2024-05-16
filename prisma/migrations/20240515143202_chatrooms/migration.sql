-- DropForeignKey
ALTER TABLE "chatroom_messages" DROP CONSTRAINT "chatroom_messages_userId_fkey";

-- DropForeignKey
ALTER TABLE "chatroom_participants" DROP CONSTRAINT "chatroom_participants_userId_fkey";

-- AlterTable
ALTER TABLE "chatroom_messages" ADD COLUMN     "aiThreadId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chatroom_participants" ADD COLUMN     "aiThreadId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chatrooms" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "withAI" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "chatroom_participants" ADD CONSTRAINT "chatroom_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatroom_messages" ADD CONSTRAINT "chatroom_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
