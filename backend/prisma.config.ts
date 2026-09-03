import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: "postgresql://postgres.lywqkecsdogmuzthjpub:Oniketprantor2002%40@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
    },
  }),
  composer: {
    configPath: "./prisma-composer.config.ts",
  },
});
