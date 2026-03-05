import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "管理员",
      password: hashedPassword,
      role: "ADMIN",
      steps: 0,
    },
  });
  console.log("Created admin user:", admin);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "测试用户",
      password: userPassword,
      role: "USER",
      steps: 100,
    },
  });
  console.log("Created test user:", user);

  // Create tasks
  const tasks = [
    { name: "每日签到", description: "每天签到获得积分", stepsReward: 10, sortOrder: 1 },
    { name: "分享应用", description: "分享给好友获得积分", stepsReward: 20, sortOrder: 2 },
    { name: "完成任务", description: "完成指定任务获得积分", stepsReward: 50, sortOrder: 3 },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.name },
      update: {},
      create: task,
    });
  }
  console.log("Created tasks");

  // Create products
  const products = [
    {
      name: "星巴克咖啡券",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
      stepsPrice: 100,
      stock: 50,
    },
    {
      name: "电影票兑换券",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
      stepsPrice: 200,
      stock: 30,
    },
    {
      name: "京东礼品卡",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=400",
      stepsPrice: 500,
      stock: 20,
    },
    {
      name: "AirPods 保护套",
      image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
      stepsPrice: 300,
      stock: 100,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    });
  }
  console.log("Created products");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
