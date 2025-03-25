-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "farmingDay" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proxy" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "type" TEXT NOT NULL DEFAULT 'http',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proxy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmulatorConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "androidId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "port" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmulatorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmulatorConfig_name_key" ON "EmulatorConfig"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmulatorConfig_androidId_key" ON "EmulatorConfig"("androidId");

-- CreateIndex
CREATE UNIQUE INDEX "EmulatorConfig_deviceId_key" ON "EmulatorConfig"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "EmulatorConfig_port_key" ON "EmulatorConfig"("port");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
