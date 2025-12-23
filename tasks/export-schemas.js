import fs from "fs";
import path from "path";
import { z } from "zod";

import {
  OrgSchema,
  DesireSchema,
  TypeSchema,
  EventSchema,
} from "../definitions/schemas.js";

const EXPORT_DIR = path.join(process.cwd(), "exports");

function exportSchema(name, schema) {
  const jsonSchema = z.toJSONSchema(schema);
  const outPath = path.join(EXPORT_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2));
  console.log(`✅ Exported ${name} -> ${outPath}`);
}
console.log(OrgSchema.title);
exportSchema("OrgSchema", OrgSchema);
exportSchema("DesireSchema", DesireSchema);
exportSchema("EventSchema", EventSchema);
exportSchema("TypeSchema", TypeSchema);
