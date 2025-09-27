import fs from "fs";
import { parse } from "yaml";
import { join } from "path";
import * as z from "zod";
import { describe, test, expect } from "vitest";
import {
  OrgSchema,
  DesireSchema,
  TypeSchema,
  EventSchema,
  HistorySchema,
} from "../definitions/schemas.js";

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
