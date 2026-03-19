export const translations = {
  // Navigation
  'nav.today': { zh: '今日', en: 'Today' },
  'nav.shopping': { zh: '采购清单', en: 'Shopping List' },

  // Day types
  'day.shrimp': { zh: '🦐 虾仁日', en: '🦐 Shrimp Day' },
  'day.beef': { zh: '🥩 牛肉日', en: '🥩 Beef Day' },

  // Weekdays
  'weekday.sun': { zh: '周日', en: 'Sun' },
  'weekday.mon': { zh: '周一', en: 'Mon' },
  'weekday.tue': { zh: '周二', en: 'Tue' },
  'weekday.wed': { zh: '周三', en: 'Wed' },
  'weekday.thu': { zh: '周四', en: 'Thu' },
  'weekday.fri': { zh: '周五', en: 'Fri' },
  'weekday.sat': { zh: '周六', en: 'Sat' },

  // Weighing labels
  'weigh.you': { zh: '👨 你', en: '👨 You' },
  'weigh.wife': { zh: '👩 老婆', en: '👩 Wife' },
  'weigh.rice': { zh: '🍚 糙米', en: '🍚 Brown rice' },
  'weigh.cooked_weight': { zh: '（熟重）', en: ' (cooked)' },
  'weigh.raw_weight': { zh: '（生重）', en: ' (raw)' },
  'weigh.vegetable': { zh: '🥬 蔬菜', en: '🥬 Vegetables' },
  'weigh.oil': { zh: '🫒 油', en: '🫒 Oil' },
  'weigh.protein_powder': { zh: '💪 蛋白粉', en: '💪 Protein powder' },
  'weigh.subtitle': {
    zh: '午晚餐总量，各自分锅炒，平分两餐',
    en: 'Lunch + dinner total, cook separately, split into two meals',
  },

  // Section titles
  'section.recipe_steps': { zh: '做法步骤', en: 'Recipe Steps' },
  'section.prep_reminders': { zh: '备餐与提醒', en: 'Prep & Reminders' },
  'section.meal_prep_tips': { zh: '备餐贴士', en: 'Meal Prep Tips' },
  'section.execution_reminders': { zh: '执行提醒', en: 'Execution Reminders' },
  'section.breakfast_details': { zh: '早餐详情', en: 'Breakfast Details' },

  // Breakfast
  'breakfast.smoothie_title': {
    zh: '🥤 早餐奶昔（两人平分）',
    en: '🥤 Breakfast Smoothie (split between two)',
  },
  'breakfast.you': { zh: '👨 你', en: '👨 You' },
  'breakfast.wife': { zh: '👩 老婆', en: '👩 Wife' },

  // Day navigation
  'daynav.prev': { zh: '前一天', en: 'Previous day' },
  'daynav.next': { zh: '后一天', en: 'Next day' },
  'daynav.jump_today': { zh: '跳回今天', en: 'Jump to today' },
  'daynav.today': { zh: '(今天)', en: '(Today)' },

  // Shopping
  'shopping.title': { zh: '🛒 一周采购清单', en: '🛒 Weekly Shopping List' },
  'shopping.progress': {
    zh: '已买 {checked} / 共 {total} 项',
    en: '{checked} / {total} bought',
  },
  'shopping.reset': { zh: '重置清单', en: 'Reset List' },
  'shopping.confirm_reset': {
    zh: '确定要清除所有勾选记录吗？',
    en: 'Clear all checked items?',
  },

  // Shopping categories
  'shopping.cat.breakfast': { zh: '早餐', en: 'Breakfast' },
  'shopping.cat.staple': { zh: '主食', en: 'Staples' },
  'shopping.cat.protein': { zh: '蛋白质', en: 'Protein' },
  'shopping.cat.vegetable': { zh: '蔬菜', en: 'Vegetables' },
  'shopping.cat.oil': { zh: '食用油', en: 'Cooking Oil' },
  'shopping.cat.pantry': { zh: '家中常备', en: 'Pantry' },

  // Metadata
  'meta.title': { zh: '夫妻减脂食谱', en: 'Couples Diet Tracker' },
} as const;

export type TranslationKey = keyof typeof translations;
