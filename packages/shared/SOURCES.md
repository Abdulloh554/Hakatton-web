# Ilmiy katalog manbalari

Tekshirilgan sana: 2026-10-04. O‘zbekcha matnlar birlamchi manbalardan qayta bayon qilingan. Bu loyiha NASA yoki ESA tomonidan tasdiqlangan mahsulot emas.

Analog ma’lum jarayon, geologik belgi yoki tadqiqot usuli bo‘yicha qiyoslash imkonini beradi. Yer yuzasidagi hech bir joy Oy yoki Marsning barcha fizik sharoitlarini takrorlamaydi. Katalog ilmiy baholangan o‘xshashlik foizini da’vo qilmaydi.

Xarita koordinatalari hududni topish uchun yaxlitlangan yo‘naltiruvchi nuqtalar; ular ekspeditsiya lagerining aniq o‘rni yoki sayohat yo‘nalishi emas. Keng maydonlar bitta nuqta bilan ko‘rsatiladi. `image` bo‘sh bo‘lsa, interfeysdagi dekoratsiya haqiqiy hudud fotosurati sifatida taqdim qilinmasligi kerak.

| Joy | Tasdiqlangan asos | Birlamchi manba |
| --- | --- | --- |
| Atakama | Quruq tuproqda hayot izlarini qidirish, burg‘ilash asboblari | [NASA JPL](https://www.jpl.nasa.gov/news/detecting-life-in-the-ultra-dry-atacama-desert/), [NASA ARADS](https://www.nasa.gov/universe/atacama-rover-astrobiology-drilling-studies-arads/) |
| Haughton | Devon orolidagi qutbiy kraterda dala tadqiqotlari | [NASA Photojournal](https://science.nasa.gov/photojournal/mars-researchers-rendezvous-on-remote-arctic-island/), [NASA fact sheet](https://www.nasa.gov/wp-content/uploads/2015/06/563511main_nasa-analog-missions-06-2011_508.pdf) |
| Rio Tinto | Kislotali temir/oltingugurt muhiti, yer osti namunalari | [NASA](https://www.nasa.gov/general/rio-tinto-spain/), [NASA burg‘ilash sinovi](https://www.nasa.gov/missions/analog-field-testing/drilling-for-data-simulating-the-search-for-life-on-mars/) |
| Mauna Kea | Vulqon yotqiziqlarida resurslarni qidirish uskunalari | [NASA ISRU](https://www.nasa.gov/mission/in-situ-resource-utilization-isru/) |
| Lanzarote | Oy bazalt tekisliklari va Mars vulqonlariga analog | [ESA dala mashg‘uloti](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Astronaut_training_in_the_land_of_volcanoes), [ESA PANGAEA](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/CAVES_and_Pangaea/What_is_PANGAEA) |
| Askja atrofi | Mars uchun Vikursandur shamol shakllari; Oy uchun Islandiyaning umumiy vulqon geologiyasi | [NASA Analog Explorer](https://science.nasa.gov/solar-system/analog-explorer/), [NASA Islandiya mashg‘uloti](https://science.nasa.gov/missions/artemis/nasas-artemis-ii-crew-uses-iceland-terrain-for-lunar-training/) |
| Svalbard / Bockfjorden | AMASE tahlil asboblari va hayot izlarini aniqlash sinovlari | [NASA GSFC](https://science.gsfc.nasa.gov/sci/projects/247/), [NASA Astrobiology](https://astrobiology.nasa.gov/news/milestone-reached-for-detecting-life-on-mars/) |
| Hanksville | Eroziyadan keyin tizmaga aylangan qadimgi daryo o‘zanlari | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/riverbeds-in-reverse-79863/) |
| Meteor Crater (Barringer) | Zarba mexanikasi va otilma tarqalishi; astronavtlar mashg‘uloti; burg‘ilash namunalari | [USGS data release](https://www.usgs.gov/data/meteor-crater-northern-arizona-drill-hole-sample-collection-1970-1973-and-curation-2010-2013), [USGS Astrogeology](https://www.usgs.gov/media/images/aerial-image-meteor-crater-drill-hole-annotations), [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/barringer-meteor-crater-arizona-1167/) |
| Cuatro Ciénegas | Sulfatga boy suvlardan gips va stromatolitlar; Marsdagi Gale krateridagi gips izlari uchun analog | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/gypsum-on-earth-and-mars-80502/), [NASA Astrobiology field sites](https://astrobiology.nasa.gov/research-locations) |

Atakama rasmi NASA JPL maqolasidagi haqiqiy tasvir manzilidan olingan. Credit: NASA/JPL-Caltech. Qolgan joylar uchun tasdiqlangan rasm kiritilmagan. `image` bo‘sh bo‘lsa `imageCredit` ham bo‘sh bo‘lishi majburiy; bu shartni `shared` testlari tekshiradi.

## Dasturiy shartnoma

`@hakaton/shared` CommonJS `index.js` va `index.d.ts` orqali `locations`, `questions`, `filterLocations`, `gradeQuiz` eksport qiladi. Katalog va savollar `data/` ichidagi JSON fayllarda.

- `filterLocations({ q, target, terrain })`: katta-kichik harf va o‘zbekcha apostrof variantlarini tenglashtiradi; qidiruvdagi barcha so‘zlarni talab qiladi. `Mars` yoki `Oy` tanlanganda `Ikkalasi` ham kiradi. Bo‘sh, `all`, `barchasi` qiymatlari filtrni cheklamaydi. Matn o‘rnidagi obyekt yoki massiv rad qilinadi.
- `gradeQuiz(answers)`: ballni javoblar kaliti bo‘yicha hisoblaydi. Bo‘sh, takroriy, noma’lum savol, noto‘g‘ri indeks va siyrak massiv rad qilinadi. Bot bitta savolni ham tekshirishi uchun qisman urinish qabul qilinadi; `total` topshirilgan savollar sonidir. To‘liq viktorina talab qiladigan API barcha savollar yuborilganini qo‘shimcha tekshirishi kerak.
- API topshirishdan oldin savol javoblarini yashirish uchun `answer` va `explanation` maydonlarini ommaviy javobdan chiqarib tashlashi mumkin. Mijoz yuborgan `score` ishonchli ball deb qabul qilinmaydi.

Tekshiruv: `npm run test --workspace=@hakaton/shared`.
