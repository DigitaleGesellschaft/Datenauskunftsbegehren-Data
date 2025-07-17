import fs from "fs";
import { parse } from "yaml";
import { join } from "path";
import * as z from "zod";
import { describe, test } from "vitest";

function list_yaml(path) {
  return fs.readdirSync(path);
}

function read_yaml(fp) {
  return parse(fs.readFileSync(fp, { encoding: "utf-8" }));
}

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

const OrgSchema = z.object({
  name: z.string(),
  address: z.string(),
  types: z.array(z.string()),
  privacyStatement: z.object({
    paragraphs: z.array(z.string()),
    variables: z.object({
      privacyStatementDate: z.string(),
    }),
    bullets: z.array(
      z.union([
        z.string(), // Simple bullet
        z.object({
          text: z.string(),
          bullets: z.array(z.string()),
        }), // Nested bullets
      ]),
    ),
  }),
  sources: z.object({
    address: z.string().url(),
    privacyStatement: z.array(z.string().url()),
  }),
});

describe.each(list_yaml("data/events"))("event yaml", (fn) => {
  test(`${fn}`, () => {
    EventSchema.parse(read_yaml(join("data/events", fn)));
  });
});

describe.each(list_yaml("data/orgs"))("org yaml", (fn) => {
  test(`${fn}`, () => {
    EventSchema.parse(read_yaml(join("data/orgs", fn)));
  });
});

describe.each(list_yaml("data/types"))("type yaml", (fn) => {
  test(`${fn}`, () => {
    TypeSchema.parse(read_yaml(join("data/types", fn)));
  });
});
