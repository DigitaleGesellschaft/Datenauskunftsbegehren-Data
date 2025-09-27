import * as z from "zod";

export const dateStringSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()); // Checks if the date is valid
  },
  {
    message: "Invalid date string",
  },
);

// models/Paragraph.js
export const variableRegExp =
  /\{(?<type>string|number|tel|email|date)?(?::)?(?<name>[a-zA-Z]{1,})(?::)?(?<label>[a-zA-Z-. ]{0,})\}/g;

export const ParagraphString = z.string().refine(
  (val) => {
    const braceCount = (val.match(/\{/g) || []).length;
    const matches = [...val.matchAll(variableRegExp)];
    return matches.length === braceCount;
  },
  {
    message: "Invalid variable string in paragraph",
  },
);

export const EventSchema = z.object({
  handle: z.string(),
  label: z.string(),
  paragraphs: z.array(z.string()),
});

export const TypeSchema = z.object({
  handle: z.string(),
  label: z.string(),
  serviceLabel: z.string(),
  paragraphs: z.array(z.string()),
});

// TODO: action is an enum, in code, valid values is removed, ...
// models/History.js
export const HistorySchema = z.object({
  action: z.string(),
  date: dateStringSchema,
  reason: z.string(),
});

// models/Bullet.js
export const BulletsSchema = z.union([
  z.string(), // Simple bullet
  z.object({
    text: z.string(),
    get bullets() {
      return z.array(BulletsSchema);
    },
  }), // Nested bullets
]);

// models/PrivacyStatement.js
export const PrivacyStatementSchema = z.object({
  paragraphs: z.array(ParagraphString).optional(),
  variables: z
    .object({
      privacyStatementDate: z.string(),
    })
    .optional(),
  bullets: z.array(BulletsSchema).optional(),
});

export const OrgType = z.enum([
  "gastro",
  "credit",
  "address",
  "online",
  "wlan",
  "mobility",
  "payback",
  "mobile",
  "parkingprovider",
]);

// see svelte code models/org.js what is optional and what not
export const OrgSchema = z.object({
  name: z.string(),
  address: z.string(),
  types: z.array(OrgType).optional(),
  privacyStatement: PrivacyStatementSchema.optional(),
  // sources is not used inside the frontend code and stripped
  sources: z.object({
    address: z.string().url(),
    privacyStatement: z.array(z.string().url()).optional(),
  }),
  history: z.array(HistorySchema).optional(),
});

export const DesireSchema = z.object({
  handle: z.string(),
  label: z.string(),
  paragraphs: z.array(z.string()).optional(),
});
