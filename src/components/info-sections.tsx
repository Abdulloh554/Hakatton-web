"use client";

import { Compass, Moon, Send } from "lucide-react";

export function MethodSection() {
  return (
    <section className="method-section" id="method">
      <div>
        <p className="eyebrow"><span /> Metod</p>
        <h2>Har o‘xshashlikning<br /><em>chegarasi bor.</em></h2>
      </div>
      <div className="method-copy">
        <p>
          Terra Analog “bu joy Mars” demaydi. Biz Yer sharoitidan boshqa sayyoralardagi geologik
          jarayonni yaxshiroq tushunish uchun foydalanamiz.
        </p>
        <ol>
          <li>
            <span>01</span>
            <div><b>Relyefni toping</b><small>Cho‘l, lava, krater yoki mineral suv oqimi.</small></div>
          </li>
          <li>
            <span>02</span>
            <div><b>Jarayonni solishtiring</b><small>Shamol, suv, vulqon yoki muz qanday shakl berganini ko‘ring.</small></div>
          </li>
          <li>
            <span>03</span>
            <div><b>Chegarani unutmang</b><small>Atmosfera, tortishish va vaqt sharoitlari butunlay bir xil emas.</small></div>
          </li>
        </ol>
      </div>
    </section>
  );
}

export function BotSection({ botUsername }: { botUsername?: string }) {
  return (
    <section className="bot-section" id="bot">
      <div className="bot-orb"><Moon size={39} /></div>
      <div>
        <p className="eyebrow"><span /> Telegramda ham</p>
        <h2>Kashfiyotlarni<br />yoningizda olib yuring.</h2>
        <p>Botdan tasodifiy hudud, tezkor quiz va saqlangan joylaringizni oching.</p>
      </div>
      {botUsername ? (
        <a className="primary-button" href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer">
          Botni ochish <Send size={18} />
        </a>
      ) : (
        <div className="bot-pending"><Send size={18} /><span>Bot hali ulanmagan</span></div>
      )}
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <a className="brand" href="#home">
        <span className="brand-mark"><Compass size={19} /></span>
        <span>TERRA<br /><b>ANALOG</b></span>
      </a>
      <p>Yer geologiyasi orqali Oy va Marsni tushunishga yordam beruvchi ochiq o‘quv loyihasi.</p>
      <span>NASA Space Apps Challenge</span>
    </footer>
  );
}