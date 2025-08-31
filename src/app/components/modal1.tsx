export default function Modal1() {
  return (
    <div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => {
          const modal = document.getElementById(
            "my_modal_1"
          ) as HTMLDialogElement | null;
          if (modal) {
            modal.showModal();
          }
        }}
      >
        📖 วิธีการใช้งาน
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">**รายละเอียดการใช้งาน**</h3>
          <p className="py-4">
            1. เลือกหลักสูตรที่ต้องการประเมิน
            <br />
            2. กรอกคะแนน GPAX และคะแนน NetSat, สมรรถนะ, TGAT TPAT
            <br />
            3. กดปุ่ม &quot;แสดงผลลัพธ์&quot; เพื่อดูผลลัพธ์
            <br />
            4. ผลลัพธ์จะแสดงความเป็นไปได้ในการเข้าศึกษาในหลักสูตรที่เลือก
            <br />
            <br />
            **โปรดตรวจสอบคะแนน ให้ครบถ้วนตามที่หลักสูตรแต่ละสาขาวิชากำหนด**
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
