import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          {/* الشعار: يغير لونه في الوضع الليلي ليبقى واضحاً */}
          <h1 className="text-3xl font-bold font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
            ThinkBoard
          </h1>
          <div>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <PlusIcon size={16} />
              New Note
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;