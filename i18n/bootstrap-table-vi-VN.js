/**
 * Bootstrap Table Vietnamese translation
 * Author: tanbt
 */

$.fn.bootstrapTable.locales['vi-VN'] = $.fn.bootstrapTable.locales['vi'] = {
  formatCopyRows() {
    return 'Sao chép hàng (những) hàng'
  },
  formatPrint() {
    return 'In'
  },
  formatLoadingMessage() {
    return 'Đang tải'
  },
  formatRecordsPerPage(pageNumber) {
    return `${pageNumber} hàng mỗi trang`
  },
  formatShowingRows(pageFrom, pageTo, totalRows, totalNotFiltered) {
    if (totalNotFiltered !== undefined && totalNotFiltered > 0 && totalNotFiltered > totalRows) {
      return `Từ hàng ${pageFrom} đến ${pageTo} của ${totalRows} hàng (được lọc từ ${totalNotFiltered} tổng số hàng)`
    }

    return `Từ hàng ${pageFrom} đến ${pageTo} của ${totalRows} hàng`
  },
  formatSRPaginationPreText() {
    return 'trang trước'
  },
  formatSRPaginationPageText(page) {
    return `tới trang ${page}`
  },
  formatSRPaginationNextText() {
    return 'trang tiếp'
  },
  formatDetailPagination(totalRows) {
    return `Hiển thị ${totalRows} (những) hàng`
  },
  formatClearSearch() {
    return 'Làm mới tìm kiếm '
  },
  formatSearch() {
    return 'Tìm kiếm'
  },
  formatNoMatches() {
    return 'Không tìm thấy dữ liệu'
  },
  formatPaginationSwitch() {
    return 'Ẩn/Hiện danh sách'
  },
  formatPaginationSwitchDown() {
    return 'Hiện danh sách'
  },
  formatPaginationSwitchUp() {
    return 'Ẩn danh sách'
  },
  formatRefresh() {
    return 'Làm mới'
  },
  formatToggleOn() {
    return 'Hiện hiển thị thẻ'
  },
  formatToggleOff() {
    return 'Ẩn hiển thị thẻ'
  },
  formatColumns() {
    return 'Cột'
  },
  formatColumnsToggleAll() {
    return 'Chuyển đổi tất cả'
  },
  formatFullscreen() {
    return 'Toàn màn hình'
  },
  formatAllRows() {
    return 'Tất cả hàng'
  },
  formatAutoRefresh() {
    return 'Tự động làm mới'
  },
  formatExport() {
    return 'Xuất dữ liệu'
  },
  formatJumpTo() {
    return 'TỚI'
  },
  formatAdvancedSearch() {
    return 'Tìm kiếm nâng cao'
  },
  formatAdvancedCloseButton() {
    return 'Đóng'
  },
  formatFilterControlSwitch() {
    return 'Ẩn/Hiện điều khiển'
  },
  formatFilterControlSwitchHide() {
    return 'Ẩn điều khiển'
  },
  formatFilterControlSwitchShow() {
    return 'Hiện điều khiển'
  },
  formatAddLevel() {
    return "Thêm cột sắp xếp"
  },
  formatCancel() {
    return "Hủy"
  },
  formatColumn() {
    return "Cột"
  },
  formatDeleteLevel() {
    return "Xóa cột sắp xếp"
  },
  formatDuplicateAlertTitle() {
    return "Phát hiện Trùng lặp!"
  },
  formatDuplicateAlertDescription() {
    return "Vui lòng xóa hoặc thay đổi bất kỳ cột trùng lặp nào."
  },
  formatMultipleSort() {
    return "Sắp xếp đa cột"
  },
  formatOrder() {
    return "Thứ tự"
  },
  formatSort() {
    return "Sắp xếp"
  },
  formatSortBy() {
    return "Sắp xếp theo"
  },
  formatSortOrders() {
    return {
      asc: "Tăng dần",
      desc: "Giảm dần"
    };
  },
  formatThenBy() {
    return "Sau đó sắp xếp theo"
  },
  formatToggleCustomViewOn() {
    return "Hiện thẻ thiết bị"
  },
  formatToggleCustomViewOff() {
    return "Hiện bảng thiết bị"
  }
}

Object.assign($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['vi-VN'])
