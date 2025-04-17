import {
  formatDistanceToNowStrict,
  parseISO,
  differenceInDays,
} from "date-fns";
import { ja } from "date-fns/locale";
import "./style.scss";

export default defineContentScript({
  matches: ["https://manaba.tsukuba.ac.jp/*"],
  main() {
    colorizeManaba();
  },
});

interface ColumnIndexes {
  TYPE?: number;
  TITLE?: number;
  STATUS?: number;
  COURSE?: number;
  STARTS_AT?: number;
  ENDS_AT?: number;
  RANGE?: number;
}

const STATUS_TEXTS = {
  notSubmitted: "未提出",
  closed: "受付終了",
};

const COLOR_THRESHOLDS: {
  days: number;
  className: string;
}[] = [
  { days: 1, className: "one-day-left" },
  { days: 3, className: "three-days-left" },
  { days: 7, className: "seven-days-left" },
];

const COLUMN_TITLES = {
  TYPE: "タイプ",
  TITLE: "タイトル",
  STATUS: "状態",
  COURSE: "コース",
  STARTS_AT: "受付開始日時",
  ENDS_AT: "受付終了日時",
};

let column_indexes: ColumnIndexes = {};

const classNameFromDiffDays = (diffDays: number): string | undefined =>
  COLOR_THRESHOLDS.find(({ days }) => diffDays <= days)?.className;

const colorizeManaba = () => {
  const titleRow = document.querySelector("table.stdlist > tbody > tr.title");
  if (!titleRow) return;

  type availableColumnTitles = keyof typeof COLUMN_TITLES;
  Array.from(titleRow.children).forEach((element, idx) => {
    element.removeAttribute("width");
    const matchedKey = Object.keys(COLUMN_TITLES).find(
      (key) =>
        COLUMN_TITLES[key as availableColumnTitles] === element.textContent
    );

    if (matchedKey) {
      column_indexes[matchedKey as availableColumnTitles] = idx;
    }
  });

  if (!column_indexes.ENDS_AT) {
    return;
  }

  const daysLeftColumnTitle = document.createElement("th");
  daysLeftColumnTitle.textContent = "残り日数";
  titleRow.append(daysLeftColumnTitle);

  const rows = Array.from(
    document.querySelectorAll("table.stdlist > tbody > tr:is(.row0, .row1)")
  );

  rows.forEach((row) => {
    const columns = Array.from(row.children);

    if (column_indexes.STATUS) {
      const statusText = columns[column_indexes.STATUS]?.textContent?.trim();
      if (
        statusText === STATUS_TEXTS.notSubmitted ||
        statusText === STATUS_TEXTS.closed
      ) {
        return;
      }
    }

    const deadlineText = column_indexes.ENDS_AT
      ? columns[column_indexes.ENDS_AT]?.textContent
      : undefined;
    if (!deadlineText) return;

    const deadline = parseISO(deadlineText);
    const now = new Date();
    const diffDays = differenceInDays(deadline, now);

    const className = classNameFromDiffDays(diffDays);
    if (className) {
      row.classList.add(className);
    }

    const daysLeftColumn = document.createElement("td");
    daysLeftColumn.textContent = `約${formatDistanceToNowStrict(deadline, {
      locale: ja,
      addSuffix: true,
    })}`;
    row.append(daysLeftColumn);
  });
};
