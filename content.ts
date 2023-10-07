import "./style.scss"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import "dayjs/locale/ja"

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.guess()

const STATUS_TEXTS = {
  notSubmitted: "未提出",
  closed: "受付終了",
}

const COLOR_THRESHOLDS = [
  { days: 1, className: "one-day-left" },
  { days: 3, className: "three-days-left" },
  { days: 7, className: "seven-days-left" },
]

const COLUMN_TITLES = {
  TYPE: "タイプ",
  TITLE: "タイトル",
  STATUS: "状態",
  COURSE: "コース",
  STARTS_AT: "受付開始日時",
  ENDS_AT: "受付終了日時",
};

let column_indexes = {
  TYPE: undefined,
  TITLE: undefined,
  STATUS: undefined,
  COURSE: undefined,
  STARTS_AT: undefined,
  ENDS_AT: undefined,
  RANGE: undefined,
}

const classNameFromDiffDays = (diffDays: number): string | undefined =>
  COLOR_THRESHOLDS.find(({ days }) => diffDays <= days)?.className

const colorizeManaba = () => {

  const titleRow = document.querySelector("table.stdlist > tbody > tr.title");

  for (const [idx, element] of Array.from(titleRow.children).entries()) {
    element.removeAttribute("width");

    const matchedKey = Object.keys(COLUMN_TITLES).find(key => COLUMN_TITLES[key] === element.textContent);

    if (matchedKey) {
      column_indexes[matchedKey] = idx;
    }
  }

  if (!column_indexes.ENDS_AT) {
    return
  }

  const daysLeftColumnTitle = document.createElement("th")
  daysLeftColumnTitle.textContent = "残り日数"

  titleRow.append(daysLeftColumnTitle)

  const rows = Array.from(document.querySelectorAll("table.stdlist > tbody > tr:is(.row0, .row1)"));

  for (const [idx, row] of rows.entries()) {
    const columns = Array.from(row.children)

    // 状態カラムが存在するページでは状態に応じて色をつける処理をスキップ
    if (column_indexes.STATUS) {
      const status = Array.from(columns[column_indexes.STATUS].childNodes).map((child) => child.textContent.trim()).filter(child => child != "")
      if (!status.includes(STATUS_TEXTS.notSubmitted) || status.includes(STATUS_TEXTS.closed)) {
        continue
      }
    }

    const deadlineText = columns[column_indexes.ENDS_AT].textContent
    const deadline = dayjs(deadlineText, "YYYY-MM-DD HH:mm")

    const now = dayjs()

    const diffDays = deadline.diff(now, "days")
    row.classList.add(classNameFromDiffDays(diffDays))

    const daysLeftColumn = document.createElement("td")
    daysLeftColumn.textContent = `約${deadline.locale("ja").fromNow(true)}`

    row.append(daysLeftColumn)
  }
}

colorizeManaba()