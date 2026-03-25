import { useNotification } from '../components/toasts/toastContext'

/**
 * defaultErrorHandler hooks
 * @return {*} defaultErrorHandler hooks
 */
export default function useDefaultErrorHandler() {
  const { notifyError } = useNotification()
  return { defaultErrorHandler: notifyError }
}
