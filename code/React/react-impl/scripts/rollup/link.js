#!bin/env node

import { exec } from "node:child_process";

exec('cd ../../dist/react & pnpm link --global')