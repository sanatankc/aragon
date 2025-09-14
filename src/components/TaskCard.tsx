export default function TaskCard({ task, isMobile }: { task: any; isMobile?: boolean }) {
  return (
    <div className={`bg-[#2c2c38] rounded-lg text-white hover:bg-[#3C4552] transition-colors ${
      isMobile ? 'p-3' : 'p-4'
    }`}>
      <div className={`font-bold mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {task.title}
      </div>
      <div className={`text-[#828FA3] ${isMobile ? 'text-xs' : 'text-xs'}`}>
        1 of 3 substasks
      </div>
    </div>
  );
}