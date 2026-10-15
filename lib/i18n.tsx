'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export type Lang = 'vi' | 'en' | 'zh'

const vi = {
  subtitle: 'Nhập và tra cứu lý do chậm trễ theo Items No và Lot.',
  totalRecords: 'Tổng bản ghi',
  missingReason: 'Chưa có lý do',
  hasReason: 'Đã có lý do',
  filterNow: 'Lọc ngay',
  list: 'Danh sách',
  reload: 'Tải lại',
  searchLabel: 'Tìm theo Items No hoặc Lot hoặc Buyer',
  searchPlaceholder: 'Tìm theo Items No hoặc Lot hoặc Buyer...',
  search: 'Tìm kiếm',
  noData: 'Không có dữ liệu phù hợp',
  clearFilters: 'Xóa bộ lọc',
  clearAll: 'Xóa tất cả',
  loading: 'Đang tải...',
  loadError: 'Không tải được dữ liệu',
  keyword: 'Từ khóa',
  remove: 'Bỏ',
  prevPage: 'Trang trước',
  nextPage: 'Trang sau',
  showing: (from: number, to: number, total: number) => `Hiển thị ${from} - ${to} trên tổng số ${total} bản ghi`,
  statistics: 'Thống kê',
  // bảng
  itemsNo: 'Items No',
  itemsName: 'Items Name',
  lot: 'Lot',
  unit: 'Unit',
  quantity: 'Quantity',
  priceUsd: 'Price USD',
  custStyle: 'Cust Style',
  buyer: 'Buyer',
  stockDays: 'Stock Days',
  delayReason: 'Delay Reason',
  updated: 'Cập nhật',
  // form
  enterReason: 'Nhập Delay Reason',
  prefilledLink: 'Đã điền sẵn từ báo cáo BI.',
  prefilledRow: 'Đã điền từ dòng bạn chọn.',
  editHint: 'Bạn có thể sửa Items No / Lot nếu cần.',
  placeholderGoods: 'VD: GD-001',
  placeholderLot: 'VD: LOT2026',
  placeholderReason: 'Nhập lý do chậm trễ...',
  save: 'Lưu',
  saving: 'Đang lưu...',
  saveFailed: 'Lưu thất bại',
  resetForm: 'Làm mới',
  savedUpdate: (g: string, l: string) => `Đã cập nhật ${g} / ${l}`,
  savedNew: (g: string, l: string) => `Đã thêm mới ${g} / ${l}`,
  // bộ lọc
  filter: 'Bộ lọc',
  advancedFilter: 'Bộ lọc nâng cao',
  advancedFilterHint: 'Lọc chính xác theo từng trường',
  contains: 'Chứa...',
  reasonStatus: 'Trạng thái Delay Reason',
  all: 'Tất cả',
  allHint: 'Hiển thị mọi bản ghi',
  missingHint: 'Delay Reason NULL hoặc rỗng',
  filledHint: 'Đã nhập Delay Reason',
  resetFilter: 'Đặt lại',
  apply: 'Áp dụng',
}

type Dict = typeof vi

const en: Dict = {
  subtitle: 'Enter and look up delay reasons by Items No and Lot.',
  totalRecords: 'Total records',
  missingReason: 'No reason yet',
  hasReason: 'Has reason',
  filterNow: 'Filter now',
  list: 'List',
  reload: 'Reload',
  searchLabel: 'Search by Items No, Lot or Buyer',
  searchPlaceholder: 'Search by Items No, Lot or Buyer...',
  search: 'Search',
  noData: 'No matching data',
  clearFilters: 'Clear filters',
  clearAll: 'Clear all',
  loading: 'Loading...',
  loadError: 'Failed to load data',
  keyword: 'Keyword',
  remove: 'Remove',
  prevPage: 'Previous',
  nextPage: 'Next',
  showing: (from, to, total) => `Showing ${from} - ${to} of ${total} records`,
  statistics: 'Statistics',
  itemsNo: 'Items No',
  itemsName: 'Items Name',
  lot: 'Lot',
  unit: 'Unit',
  quantity: 'Quantity',
  priceUsd: 'Price USD',
  custStyle: 'Cust Style',
  buyer: 'Buyer',
  stockDays: 'Stock Days',
  delayReason: 'Delay Reason',
  updated: 'Updated',
  enterReason: 'Enter Delay Reason',
  prefilledLink: 'Pre-filled from the BI report.',
  prefilledRow: 'Filled from the row you selected.',
  editHint: 'You can edit Items No / Lot if needed.',
  placeholderGoods: 'e.g. GD-001',
  placeholderLot: 'e.g. LOT2026',
  placeholderReason: 'Enter the delay reason...',
  save: 'Save',
  saving: 'Saving...',
  saveFailed: 'Save failed',
  resetForm: 'Reset',
  savedUpdate: (g, l) => `Updated ${g} / ${l}`,
  savedNew: (g, l) => `Added ${g} / ${l}`,
  filter: 'Filters',
  advancedFilter: 'Advanced filters',
  advancedFilterHint: 'Filter precisely by field',
  contains: 'Contains...',
  reasonStatus: 'Delay Reason status',
  all: 'All',
  allHint: 'Show all records',
  missingHint: 'Delay Reason is NULL or empty',
  filledHint: 'Delay Reason entered',
  resetFilter: 'Reset',
  apply: 'Apply',
}

const zh: Dict = {
  subtitle: '按物料编号和批号录入、查询延误原因。',
  totalRecords: '总记录数',
  missingReason: '暂无原因',
  hasReason: '已有原因',
  filterNow: '立即筛选',
  list: '列表',
  reload: '刷新',
  searchLabel: '按物料编号、批号或客户搜索',
  searchPlaceholder: '按物料编号、批号或客户搜索...',
  search: '搜索',
  noData: '没有符合条件的数据',
  clearFilters: '清除筛选',
  clearAll: '全部清除',
  loading: '加载中...',
  loadError: '无法加载数据',
  keyword: '关键词',
  remove: '移除',
  prevPage: '上一页',
  nextPage: '下一页',
  showing: (from, to, total) => `显示第 ${from} - ${to} 条，共 ${total} 条记录`,
  statistics: '统计',
  itemsNo: '物料编号',
  itemsName: '物料名称',
  lot: '批号',
  unit: '单位',
  quantity: '数量',
  priceUsd: '单价 USD',
  custStyle: '客户款号',
  buyer: '客户',
  stockDays: '库龄(天)',
  delayReason: '延误原因',
  updated: '更新时间',
  enterReason: '填写延误原因',
  prefilledLink: '已根据 BI 报表自动填写。',
  prefilledRow: '已根据所选行填写。',
  editHint: '如有需要，可修改物料编号 / 批号。',
  placeholderGoods: '例如：GD-001',
  placeholderLot: '例如：LOT2026',
  placeholderReason: '请输入延误原因...',
  save: '保存',
  saving: '保存中...',
  saveFailed: '保存失败',
  resetForm: '重置',
  savedUpdate: (g, l) => `已更新 ${g} / ${l}`,
  savedNew: (g, l) => `已新增 ${g} / ${l}`,
  filter: '筛选',
  advancedFilter: '高级筛选',
  advancedFilterHint: '按字段精确筛选',
  contains: '包含...',
  reasonStatus: '延误原因状态',
  all: '全部',
  allHint: '显示所有记录',
  missingHint: '延误原因为空',
  filledHint: '已填写延误原因',
  resetFilter: '重置',
  apply: '应用',
}

const dictionaries: Record<Lang, Dict> = { vi, en, zh }
export const locales: Record<Lang, string> = { vi: 'vi-VN', en: 'en-US', zh: 'zh-CN' }

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict }

const LangContext = createContext<Ctx>({ lang: 'vi', setLang: () => {}, t: vi })

const STORAGE_KEY = 'reason-lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi')

  // Đọc lựa chọn đã lưu sau khi trang tải xong (tránh lệch giao diện giữa server và client)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'vi' || saved === 'en' || saved === 'zh') setLangState(saved)
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }, [])

  return <LangContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

const options: { value: Lang; label: string }[] = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
]

export function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label="Language" className="ml-auto flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          size="sm"
          variant={lang === o.value ? 'default' : 'ghost'}
          onClick={() => setLang(o.value)}
          aria-pressed={lang === o.value}
          className="h-7 px-2.5 text-xs"
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}

/** Phụ đề dưới tiêu đề trang (client component để đổi theo ngôn ngữ) */
export function PageSubtitle() {
  const { t } = useLang()
  return <p className="mt-1.5 text-pretty text-muted-foreground">{t.subtitle}</p>
}