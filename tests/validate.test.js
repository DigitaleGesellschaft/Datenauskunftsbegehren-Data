import fs from "fs";
import { parse } from "yaml";
import { join } from "path";
import * as z from "zod";
import { describe, test, expect } from "vitest";

function list_yaml(path) {
  return fs.readdirSync(path);
}

function read_yaml(fp) {
  return parse(fs.readFileSync(fp, { encoding: "utf-8" }));
}

function validate(data, schema) {
  const result = schema.safeParse(data);
  if (result.error) {
    return result.error.issues;
  }
  return null;
}

const dateStringSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()); // Checks if the date is valid
  },
  {
    message: "Invalid date string",
  },
);

// models/Paragraph.js
const variableRegExp =
  /\{(?<type>string|number|tel|email|date)?(?::)?(?<name>[a-zA-Z]{1,})(?::)?(?<label>[a-zA-Z-. ]{0,})\}/g;

const ParagraphString = z.string().refine(
  (val) => {
    const braceCount = (val.match(/\{/g) || []).length;
    const matches = [...val.matchAll(variableRegExp)];
    return matches.length === braceCount;
  },
  {
    message: "Invalid variable string in paragraph",
  },
);

const EventSchema = z.object({
  handle: z.string(),
  label: z.string(),
  paragraphs: z.array(z.string()),
});

const TypeSchema = z.object({
  handle: z.string(),
  label: z.string(),
  serviceLabel: z.string(),
  paragraphs: z.array(z.string()),
});

// TODO: action is an enum, in code, valid values is removed, ...
// models/History.js
const HistorySchema = z.object({
  action: z.string(),
  date: dateStringSchema,
  reason: z.string(),
});

// models/Bullet.js
const BulletsSchema = z.union([
  z.string(), // Simple bullet
  z.object({
    text: z.string(),
    get bullets() {
      return z.array(BulletsSchema);
    },
  }), // Nested bullets
]);

// models/PrivacyStatement.js
const PrivacyStatementSchema = z.object({
  paragraphs: z.array(ParagraphString).optional(),
  variables: z
    .object({
      privacyStatementDate: z.string(),
    })
    .optional(),
  bullets: z.array(BulletsSchema).optional(),
});

const OrgType = z.enum([
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
const OrgSchema = z.object({
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

const DesireSchema = z.object({
  handle: z.string(),
  label: z.string(),
  paragraphs: z.array(z.string()).optional(),
});

describe.each(list_yaml("data/events"))("event yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/events", fn)), EventSchema),
    ).not.toBeTruthy();
  });
});

const org_listing = list_yaml("data/orgs");
//const org_listing = ["Blick.yml"];

describe.each(org_listing)("org yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/orgs", fn)), OrgSchema),
    ).not.toBeTruthy();
  });
});

describe.each(list_yaml("data/types"))("type yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/types", fn)), TypeSchema),
    ).not.toBeTruthy();
  });
});

describe.each(list_yaml("data/desires"))("desire yaml", (fn) => {
  test(`${fn}`, () => {
    expect(
      validate(read_yaml(join("data/desires", fn)), DesireSchema),
    ).not.toBeTruthy();
  });
});

test("history schema", () => {
  const yd = `
  action: removed
  date: '2021-06-05T00:00:00.000Z'
  reason: 'Die Firma XY....'
  `;
  expect(validate(parse(yd), HistorySchema)).not.toBeTruthy();
});
