import type {
  MealPlan,
  FixedBreakfast,
  Ingredient,
  PersonWeighing,
  DayPlan,
  Recipe,
  ShoppingList,
  ShoppingItem,
} from './types';

/**
 * Parse a Chinese Markdown meal plan into a structured MealPlan object.
 */
export function parseMealPlan(markdown: string): MealPlan {
  return {
    fixedBreakfast: parseFixedBreakfast(markdown),
    weekPlan: parseWeekPlan(markdown),
    shoppingList: parseShoppingList(markdown),
    recipes: parseRecipes(markdown),
    mealPrepTips: parseMealPrepTips(markdown),
    executionReminders: parseExecutionReminders(markdown),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract a section between a heading and the next heading of same or higher level, or --- */
function extractSection(markdown: string, headingPattern: string, level: number = 2): string {
  const lines = markdown.split('\n');
  let capturing = false;
  const captured: string[] = [];
  const hPrefix = '#'.repeat(level) + ' ';

  for (const line of lines) {
    if (!capturing) {
      if (line.startsWith(hPrefix) && line.includes(headingPattern)) {
        capturing = true;
        continue;
      }
    } else {
      // Stop at next heading of same or higher level, or ---
      if (/^#{1,2}\s/.test(line) && level <= 2) break;
      if (level === 2 && line.trim() === '---') break;
      if (level === 3) {
        const lineLevel = line.match(/^(#+)/)?.[1].length ?? 99;
        if (lineLevel <= level && !line.startsWith('#### ')) break;
      }
      captured.push(line);
    }
  }
  return captured.join('\n');
}

/** Parse markdown table rows (skip header and separator). Returns arrays of cell strings. */
function parseTableRows(text: string): string[][] {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  // Skip header row and separator row
  return lines.slice(2).map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
  );
}

/** Parse protein string like "虾仁 310.9g" into name and amount */
function parseProteinCell(cell: string): { name: string; amount: number } {
  const match = cell.match(/^(.+?)\s+([\d.]+)\s*g$/);
  if (!match) throw new Error(`Cannot parse protein: "${cell}"`);
  return { name: match[1], amount: parseFloat(match[2]) };
}

// ---------------------------------------------------------------------------
// Fixed Breakfast
// ---------------------------------------------------------------------------

function parseFixedBreakfast(markdown: string): FixedBreakfast {
  const smoothie = parseSmoothieIngredients(markdown);

  const breakfastSection = extractSection(markdown, '固定早餐');
  const rows = parseTableRows(breakfastSection);

  let you = '';
  let wife = '';
  for (const row of rows) {
    const person = row[0];
    const content = row[1];
    if (person.includes('你老婆')) {
      wife = content.trim();
    } else if (person.includes('你')) {
      you = content.trim();
    }
  }

  return { smoothie, you, wife };
}

function parseSmoothieIngredients(markdown: string): Ingredient[] {
  // Only search within the 奶昔总配方 subsection
  const lines = markdown.split('\n');
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    if (line.includes('奶昔总配方')) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^###?\s/.test(line) || line.trim() === '---') break;
      sectionLines.push(line);
    }
  }

  const ingredients: Ingredient[] = [];
  const regex = /^-\s+(.+?)\s+\*\*(\d+)\s*(ml|g)\*\*/gm;
  const text = sectionLines.join('\n');
  let match;
  while ((match = regex.exec(text)) !== null) {
    ingredients.push({
      name: match[1],
      amount: parseFloat(match[2]),
      unit: match[3],
    });
  }
  return ingredients;
}

// ---------------------------------------------------------------------------
// Week Plan (7 days)
// ---------------------------------------------------------------------------

function parseWeekPlan(markdown: string): DayPlan[] {
  const templates = parseWeighingTemplates(markdown);

  const scheduleSection = extractSection(markdown, '7 天执行表');
  const rows = parseTableRows(scheduleSection);

  return rows.map((row) => {
    const dayNum = parseInt(row[0].replace(/\D/g, ''), 10);
    const dayType = row[1].trim() as '虾仁日' | '牛肉日';
    const menu = row[2].trim();

    const youTemplate = dayType === '虾仁日' ? templates.youShrimp : templates.youBeef;
    const wifeTemplate = dayType === '虾仁日' ? templates.wifeShrimp : templates.wifeBeef;

    return {
      day: dayNum,
      dayType,
      menu,
      you: youTemplate,
      wife: wifeTemplate,
    };
  });
}

interface WeighingTemplates {
  youShrimp: PersonWeighing;
  youBeef: PersonWeighing;
  wifeShrimp: PersonWeighing;
  wifeBeef: PersonWeighing;
}

function parseWeighingTemplates(markdown: string): WeighingTemplates {
  const section = extractSection(markdown, '每天实际称重清单');
  const lines = section.split('\n');

  let currentPerson: 'you' | 'wife' | null = null;
  const youLines: string[] = [];
  const wifeLines: string[] = [];

  for (const line of lines) {
    if (/^###\s+你老婆/.test(line)) {
      currentPerson = 'wife';
      continue;
    } else if (/^###\s+你/.test(line)) {
      currentPerson = 'you';
      continue;
    }
    if (currentPerson === 'you') youLines.push(line);
    else if (currentPerson === 'wife') wifeLines.push(line);
  }

  const youRows = parseTableRows(youLines.join('\n'));
  const wifeRows = parseTableRows(wifeLines.join('\n'));

  function rowToWeighing(row: string[]): PersonWeighing {
    const protein = parseProteinCell(row[2]);
    return {
      rice: parseFloat(row[1]),
      protein: { name: protein.name, amount: protein.amount, weightBasis: 'raw' as const },
      vegetable: parseFloat(row[3]),
      oil: parseFloat(row[4]),
      powder: parseFloat(row[5]),
    };
  }

  return {
    youShrimp: rowToWeighing(youRows[0]),
    youBeef: rowToWeighing(youRows[1]),
    wifeShrimp: rowToWeighing(wifeRows[0]),
    wifeBeef: rowToWeighing(wifeRows[1]),
  };
}

// ---------------------------------------------------------------------------
// Shopping List
// ---------------------------------------------------------------------------

function parseShoppingList(markdown: string): ShoppingList {
  const section = extractSection(markdown, '一周只买一次菜：购物清单');

  const breakfast = parseShoppingCategory(section, '早餐部分', 'breakfast');
  const staple = parseShoppingCategory(section, '主食部分', 'staple');
  const protein = parseShoppingCategory(section, '蛋白质部分', 'protein');
  const vegetable = parseVegetableCategory(section);
  const { oil, pantry } = parseOilAndPantry(section);

  return { breakfast, staple, protein, vegetable, oil, pantry };
}

function parseShoppingCategory(
  section: string,
  subsectionName: string,
  category: string
): ShoppingItem[] {
  const sub = extractSubsection(section, subsectionName);
  const rows = parseTableRows(sub);
  return rows.map((row, i) => makeShoppingItem(category, i, row[0], row[1], row[2] || undefined));
}

function extractSubsection(section: string, name: string): string {
  const lines = section.split('\n');
  let capturing = false;
  const captured: string[] = [];

  for (const line of lines) {
    if (!capturing) {
      if (line.includes(name)) {
        capturing = true;
        continue;
      }
    } else {
      if (/^###\s/.test(line)) break;
      captured.push(line);
    }
  }
  return captured.join('\n');
}

function parseVegetableCategory(section: string): ShoppingItem[] {
  const sub = extractSubsection(section, '午晚餐蔬菜部分');
  const lines = sub.split('\n');

  let inSuggested = false;
  const suggestedLines: string[] = [];
  const mainLines: string[] = [];
  let passedSuggested = false;

  for (const line of lines) {
    if (line.includes('建议买菜分配')) {
      inSuggested = true;
      passedSuggested = true;
      continue;
    }
    if (inSuggested) {
      suggestedLines.push(line);
    } else if (!passedSuggested) {
      mainLines.push(line);
    }
  }

  const items: ShoppingItem[] = [];
  let counter = 0;

  const mainRows = parseTableRows(mainLines.join('\n'));
  for (const row of mainRows) {
    items.push(makeShoppingItem('vegetable', counter++, row[0], row[1], row[2] || undefined));
  }

  const suggestedRows = parseTableRows(suggestedLines.join('\n'));
  for (const row of suggestedRows) {
    const note = row.length > 2 ? row[2]?.trim() || undefined : undefined;
    items.push(makeShoppingItem('vegetable', counter++, row[0], row[1], note));
  }

  return items;
}

function parseOilAndPantry(section: string): { oil: ShoppingItem[]; pantry: ShoppingItem[] } {
  const sub = extractSubsection(section, '食用油与调味料');
  const rows = parseTableRows(sub);

  const oil: ShoppingItem[] = [];
  const pantry: ShoppingItem[] = [];
  let oilCounter = 0;
  let pantryCounter = 0;

  for (const row of rows) {
    const name = row[0];
    const amountStr = row[1];
    const note = row[2]?.trim() || undefined;

    if (amountStr.includes('适量')) {
      pantry.push(makeShoppingItem('pantry', pantryCounter++, name, amountStr, note));
    } else {
      oil.push(makeShoppingItem('oil', oilCounter++, name, amountStr, note));
    }
  }

  return { oil, pantry };
}

function makeShoppingItem(
  category: string,
  index: number,
  name: string,
  amountStr: string,
  note?: string
): ShoppingItem {
  const parsed = parseQuantity(amountStr);
  const item: ShoppingItem = {
    id: `${category}:${index}`,
    name,
    quantity: parsed.quantity,
    unit: parsed.unit,
    displayAmount: amountStr.trim(),
  };
  if (note) {
    item.note = note;
  }
  return item;
}

function parseQuantity(str: string): { quantity: number | null; unit: string | null } {
  const trimmed = str.trim();
  if (trimmed === '适量') {
    return { quantity: null, unit: null };
  }
  const match = trimmed.match(/^([\d.]+)\s*(.+)$/);
  if (match) {
    return { quantity: parseFloat(match[1]), unit: match[2].trim() };
  }
  return { quantity: null, unit: null };
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

function parseRecipes(markdown: string): Recipe[] {
  const section = extractSection(markdown, '每道菜超简做法');
  const recipes: Recipe[] = [];

  const dayPattern = /^###\s+Day\s+(\d+)｜(.+)$/gm;
  let match;
  const headings: { day: number; title: string; index: number }[] = [];

  while ((match = dayPattern.exec(section)) !== null) {
    headings.push({
      day: parseInt(match[1], 10),
      title: match[2].trim(),
      index: match.index + match[0].length,
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].index;
    const end =
      i + 1 < headings.length
        ? headings[i + 1].index - headings[i + 1].title.length - 20
        : section.length;
    const body = section.substring(start, end);

    const steps: string[] = [];
    const stepRegex = /^\d+\.\s+(.+)$/gm;
    let stepMatch;
    while ((stepMatch = stepRegex.exec(body)) !== null) {
      steps.push(stepMatch[1].trim());
    }

    recipes.push({
      day: headings[i].day,
      title: headings[i].title,
      steps,
    });
  }

  return recipes;
}

// ---------------------------------------------------------------------------
// Meal Prep Tips
// ---------------------------------------------------------------------------

function parseMealPrepTips(markdown: string): string[] {
  const section = extractSection(markdown, '备餐建议');
  const tips: string[] = [];
  const lines = section.split('\n');
  let currentTip: string[] = [];
  let inTip = false;

  for (const line of lines) {
    if (/^###\s+\d+）/.test(line)) {
      if (currentTip.length > 0) {
        tips.push(currentTip.join('\n'));
      }
      const heading = line.replace(/^###\s+\d+）\s*/, '').trim();
      currentTip = [heading];
      inTip = true;
    } else if (inTip && line.trim().startsWith('-')) {
      currentTip.push(line.trim().replace(/^-\s+/, ''));
    }
  }
  if (currentTip.length > 0) {
    tips.push(currentTip.join('\n'));
  }

  return tips;
}

// ---------------------------------------------------------------------------
// Execution Reminders
// ---------------------------------------------------------------------------

function parseExecutionReminders(markdown: string): string[] {
  const section = extractSection(markdown, '最后执行提醒');
  const reminders: string[] = [];
  const regex = /^\d+\.\s+\*\*(.+?)\*\*$/gm;
  let match;
  while ((match = regex.exec(section)) !== null) {
    reminders.push(match[1].trim());
  }
  return reminders;
}
