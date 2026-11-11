import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, MapPin, Phone, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172B24] text-gray-300 pt-12 pb-8 border-t border-emerald-950 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Identity & Pilot Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-md bg-amber-400 flex items-center justify-center text-[#174C3C]">
                <ShieldCheck className="w-5 h-5 font-bold" />
              </div>
              <span className="text-lg font-bold">GramSaksham (ग्रामसक्षम)</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your Voice. Your Rights. Accountable Governance. Empowering rural citizens across Chandil Block, Jharkhand to navigate schemes, assert statutory rights, and hold local governance accountable.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-white/5 p-2 rounded border border-white/10">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>पायलट क्षेत्र: चांडिल प्रखंड, जिला सरायकेला-खरसावां, झारखंड</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Platform Modules
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/schemes" className="hover:text-amber-300 transition">
                  GramConnect — Scheme Discovery
                </Link>
              </li>
              <li>
                <Link to="/complaint" className="hover:text-amber-300 transition">
                  Smart Panchayat — Grievance Filing
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-300 transition">
                  Status Timeline Tracker
                </Link>
              </li>
              <li>
                <Link to="/modules" className="hover:text-amber-300 transition">
                  JalWatch — Water Supply Reports
                </Link>
              </li>
              <li>
                <Link to="/modules" className="hover:text-amber-300 transition">
                  WorkVerify AI — Infrastructure Monitor
                </Link>
              </li>
              <li>
                <Link to="/modules" className="hover:text-amber-300 transition">
                  KrishiAlert — Agri Advisories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Integrity & Legal Notice */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Trust & Legal Notice</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              GramSaksham is an independent civic-technology initiative. We do not claim official authority to approve welfare benefits.
            </p>
            <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded border border-emerald-800/40 leading-relaxed">
              <strong>Conflict-of-Interest Safeguard:</strong> Any grievance filed against a village official (Mukhiya / Panchayat Secretary) is strictly routed outside their jurisdiction to higher administrative desks.
            </div>
          </div>

          {/* Col 4: Official Portals & Helpline */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Official Portals
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="https://pmayg.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>PMAY-G Official (pmayg.nic.in)</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://swachhbharatmission.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>Swachh Bharat Mission (sbm.gov.in)</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://jharsewa.jharkhand.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>Jharsewa Jharkhand Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://jharkhand.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>Jharkhand State Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>Chandil BDO Office: (06591) 222-108</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-3">
          <div>
            © {new Date().getFullYear()} GramSaksham. Designed for Rural India • Chandil Block Pilot.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy & DPDP Compliance</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Security Standards</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Whistleblower Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
