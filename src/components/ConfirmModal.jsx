import { AlertTriangle, X } from "lucide-react";

import "./ConfirmModal.css";

function ConfirmModal({
  open,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من تنفيذ هذا الإجراء؟",
  confirmText = "حذف",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  /* CONFIRM */

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  /* CANCEL */

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" dir="rtl" onMouseDown={handleCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-modal-close"
          onClick={handleCancel}
          aria-label="إغلاق"
        >
          <X size={19} />
        </button>

        <div className="confirm-modal-icon">
          <AlertTriangle size={27} />
        </div>

        <div className="confirm-modal-content">
          <h2 id="confirm-modal-title">{title}</h2>

          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={handleCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-modal-delete"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
