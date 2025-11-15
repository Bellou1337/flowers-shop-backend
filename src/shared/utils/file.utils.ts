import fs from "fs";
import { logger } from "../../lib/logger";

export const deleteFile = (filePath?: string) => {
  if (!filePath) {
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error(`Failed to delete file at ${filePath}: ${err.message}`);
    }
  });
};
