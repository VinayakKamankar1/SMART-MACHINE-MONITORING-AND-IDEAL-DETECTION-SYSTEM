import React from "react";

export default function MetricCard({
  title,
  value,
  unit = "",
  description,
  icon: Icon,
  statusType = "default", // "success", "danger", "warning", "info", "purple", "offline", "default"
  extraBadge = null,
  isMissing = false,
  accentColor = "blue", // "blue", "emerald", "amber", "rose", "purple"
}) {
  const getStatusStyles = () => {
    if (isMissing) {
      return {
        badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
        iconBg: "bg-slate-100 text-slate-400 border-slate-200",
        valueColor: "text-slate-400",
        topBorder: "border-t-slate-300",
      };
    }

    switch (statusType) {
      case "success":
        return {
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          valueColor: "text-emerald-600",
          topBorder: "border-t-emerald-500",
        };
      case "danger":
        return {
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          iconBg: "bg-rose-50 text-rose-600 border-rose-200",
          valueColor: "text-rose-600",
          topBorder: "border-t-rose-500",
        };
      case "warning":
        return {
          badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
          iconBg: "bg-amber-50 text-amber-600 border-amber-200",
          valueColor: "text-amber-600",
          topBorder: "border-t-amber-500",
        };
      case "info":
        return {
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          iconBg: "bg-blue-50 text-blue-600 border-blue-200",
          valueColor: "text-blue-600",
          topBorder: "border-t-blue-500",
        };
      case "purple":
        return {
          badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
          iconBg: "bg-purple-50 text-purple-600 border-purple-200",
          valueColor: "text-purple-600",
          topBorder: "border-t-purple-500",
        };
      default:
        return {
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-600 border-slate-200",
          valueColor: "text-slate-700",
          topBorder: "border-t-slate-400",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`light-card rounded-2xl p-5 border border-slate-200/90 border-t-4 ${styles.topBorder} flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block">
            {title}
          </span>
          {extraBadge && <div className="mt-1">{extraBadge}</div>}
        </div>
        {Icon && (
          <div
            className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 shrink-0 ${styles.iconBg} shadow-xs`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${styles.valueColor}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold font-mono text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Sub-description */}
      {description && (
        <div className="pt-2.5 border-t border-slate-100 mt-2">
          <p className="text-xs text-slate-500 font-medium">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
