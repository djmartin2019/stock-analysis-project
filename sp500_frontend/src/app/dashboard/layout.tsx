"use client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col flex-1 pl-6 pr-6 pt-3 rounded-tl-3xl bg-black">
                {children}
            </div>
        </div>
    );
}
