import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateRenderer {
  private viewsPath: string;
  private cache = new Map<string, string>();

  constructor() {
    this.viewsPath = join(__dirname, "..", "views");
  }

  private loadTemplate(templatePath: string): string {
    if (this.cache.has(templatePath)) {
      return this.cache.get(templatePath)!;
    }

    const fullPath = join(this.viewsPath, templatePath);
    const content = readFileSync(fullPath, "utf-8");
    this.cache.set(templatePath, content);
    return content;
  }

  private renderPartial(template: string, data: any = {}): string {
    // Handle each loops first: {{#each array}}...{{/each}}
    template = template.replace(
      /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayPath, content) => {
        const array = this.getValue(data, arrayPath.trim());
        if (!Array.isArray(array)) return "";

        return array.map((item) => this.renderPartial(content, item)).join("");
      }
    );

    template = this.processIfStatements(template, data);

    // Handle unless conditionals: {{#unless condition}}...{{/unless}}
    template = template.replace(
      /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
      (match, condition, content) => {
        const value = this.getValue(data, condition.trim());
        return !value ? content : "";
      }
    );

    // Handle partials: {{> partial/name}}
    template = template.replace(
      /\{\{>\s*([^}]+)\}\}/g,
      (match, partialPath) => {
        const partialTemplate = this.loadTemplate(partialPath.trim() + ".html");
        return this.renderPartial(partialTemplate, data);
      }
    );

    // Handle variables: {{variable}} and {{{variable}}} (unescaped)
    template = template.replace(
      /\{\{\{([^#/>][^}]*)\}\}\}/g,
      (match, variable) => {
        const value = this.getValue(data, variable.trim());
        return value !== undefined ? String(value) : "";
      }
    );

    template = template.replace(/\{\{([^#/>][^}]*)\}\}/g, (match, variable) => {
      const value = this.getValue(data, variable.trim());
      return value !== undefined ? String(value) : "";
    });

    return template;
  }

  // Evaluate nested {{#if}} blocks using a lightweight stack parser.
  private processIfStatements(template: string, data: any): string {
    const openTag = "{{#if";
    const closeTag = "{{/if}}";
    const elseTag = "{{else}}";

    let result = template;

    while (true) {
      const startIndex = result.indexOf(openTag);
      if (startIndex === -1) break;

      const startMatch = /\{\{#if\s+([^}]+)\}\}/.exec(result.slice(startIndex));

      if (!startMatch) {
        break;
      }

      const condition = startMatch[1].trim();
      const startTagLength = startMatch[0].length;
      let searchIndex = startIndex + startTagLength;
      let depth = 1;
      let elseIndex = -1;

      while (depth > 0) {
        const nextOpen = result.indexOf(openTag, searchIndex);
        const nextClose = result.indexOf(closeTag, searchIndex);
        const nextElse = result.indexOf(elseTag, searchIndex);

        if (nextClose === -1) {
          // Malformed template: break out to avoid infinite loop
          depth = 0;
          searchIndex = result.length;
          break;
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth += 1;
          searchIndex = nextOpen + openTag.length;
          continue;
        }

        if (
          depth === 1 &&
          nextElse !== -1 &&
          nextElse < nextClose &&
          (nextOpen === -1 || nextElse < nextOpen)
        ) {
          elseIndex = nextElse;
        }

        depth -= 1;
        searchIndex = nextClose + closeTag.length;
      }

      const blockEnd = searchIndex - closeTag.length;
      const contentStart = startIndex + startTagLength;
      const contentEnd = elseIndex !== -1 ? elseIndex : blockEnd;
      const trueContent = result.slice(contentStart, contentEnd);
      const falseContent =
        elseIndex !== -1
          ? result.slice(elseIndex + elseTag.length, blockEnd)
          : "";

      const conditionValue = this.getValue(data, condition);
      const replacementContent = conditionValue
        ? trueContent
        : elseIndex !== -1
        ? falseContent
        : "";

      const processedReplacement = this.processIfStatements(
        replacementContent,
        data
      );

      result =
        result.slice(0, startIndex) +
        processedReplacement +
        result.slice(searchIndex);
    }

    return result;
  }

  private getValue(data: any, path: string): any {
    // Handle helper functions
    if (path.startsWith("eq ")) {
      const [, value1, value2] = path.split(" ");
      return this.getValue(data, value1) == this.getValue(data, value2);
    }
    if (path.startsWith("gt ")) {
      const [, value1, value2] = path.split(" ");
      return this.getValue(data, value1) > this.getValue(data, value2);
    }
    if (path.startsWith("lt ")) {
      const [, value1, value2] = path.split(" ");
      return this.getValue(data, value1) < this.getValue(data, value2);
    }
    if (path.startsWith("and ")) {
      const parts = path.substring(4).split(" ");
      const condition1 = parts.slice(0, -1).join(" ");
      const condition2 = parts[parts.length - 1];
      return this.getValue(data, condition1) && this.getValue(data, condition2);
    }

    // Handle numeric literals
    if (!isNaN(Number(path))) {
      return Number(path);
    }

    return path.split(".").reduce((obj, key) => obj?.[key], data);
  }

  render(
    templateName: string,
    data: any = {},
    layout: string = "layout.html"
  ): string {
    const template = this.loadTemplate(templateName);
    const content = this.renderPartial(template, data);

    if (layout) {
      const layoutTemplate = this.loadTemplate(layout);
      return this.renderPartial(layoutTemplate, { ...data, CONTENT: content });
    }

    return content;
  }

  renderPartialOnly(templateName: string, data: any = {}): string {
    const template = this.loadTemplate(templateName);
    return this.renderPartial(template, data);
  }
}

export const templateRenderer = new TemplateRenderer();
