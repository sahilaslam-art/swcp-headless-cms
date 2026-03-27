import { toast } from 'react-toastify'

const defaultOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const showSuccess = (message) => {
  toast.success(message, {
    ...defaultOptions,
    className: 'bg-[#0f3d26] border border-[#22c55e] text-[#4ade80] font-headline tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    progressClassName: 'bg-[#22c55e]'
  })
}

export const showError = (message) => {
  toast.error(message, defaultOptions)
}

export const showWarning = (message) => {
  toast.warning(message, defaultOptions)
}

export const showInfo = (message) => {
  toast.info(message, defaultOptions)
}

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
}
