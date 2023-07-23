// {
// 	"countryCode": "EE",
// 	"countryLocationId": "64aa7b392c13367454158c09",
// 	"countryLocation": {
// 		"ee": "Eesti",
// 		"ru": "Эстония",
// 		"en": "Estonia"
//   },
// 	"city": {
// 		"ee": "Narva",
// 		"ru": "Нарва",
// 		"en": "Narva"
//   }
// }

const axios = require("axios");

const countryDetails = {
  EE: {
    countryCode: "EE",
    countryLocationId: "64aa7b392c13367454158c09",
    countryLocation: {
      ee: "Eesti",
      ee: "Eesti",
      ru: "Эстония",
      en: "Estonia",
      lt: "Estija",
      lv: "Igaunija",
    },
  },
  LT: {
    countryCode: "LT",
    countryLocationId: "64bd5d26d5bf21373933c260",
    countryLocation: {
      lt: "Lietuva",
      ru: "Литва",
      en: "Lithuania",
      ee: "Leedu",
      lv: "Lietuva",
    },
  },
  LV: {
    countryCode: "LV",
    countryLocationId: "64bd5d3bd5bf21373933c26e",
    countryLocation: {
      lv: "Latvija",
      ru: "Латвия",
      en: "Latvia",
      lt: "Latvija",
      ee: "Läti",
    },
  },
};

const latvianCities = [
  { lv: "Rīga", ru: "Рига", en: "Riga", lt: "Ryga", ee: "Riia" },
  {
    lv: "Daugavpils",
    ru: "Даугавпилс",
    en: "Daugavpils",
    lt: "Daugpilis",
    ee: "Daugavpils",
  },
  { lv: "Liepāja", ru: "Лиепая", en: "Liepāja", lt: "Liepoja", ee: "Liepāja" },
  { lv: "Jelgava", ru: "Елгава", en: "Jelgava", lt: "Jelgava", ee: "Jelgava" },
  { lv: "Jūrmala", ru: "Юрмала", en: "Jūrmala", lt: "Jūrmala", ee: "Jūrmala" },
];

const lithuanianCities = [
  { lt: "Vilnius", ru: "Вильнюс", en: "Vilnius", ee: "Vilnius", lv: "Vilnius" },
  { lt: "Kaunas", ru: "Каунас", en: "Kaunas", ee: "Kaunas", lv: "Kauņa" },
  {
    lt: "Klaipėda",
    ru: "Клайпеда",
    en: "Klaipėda",
    ee: "Klaipėda",
    lv: "Klaipeida",
  },
  {
    lt: "Šiauliai",
    ru: "Шяуляй",
    en: "Šiauliai",
    ee: "Šiauliai",
    lv: "Šiauliai",
  },
  {
    lt: "Panevėžys",
    ru: "Паневежис",
    en: "Panevėžys",
    ee: "Panevėžys",
    lv: "Panevežis",
  },
];

const estonianCities = [
  { ee: "Tallinn", ru: "Таллинн", en: "Tallinn", lt: "Talinas", lv: "Tallina" },
  { ee: "Tartu", ru: "Тарту", en: "Tartu", lt: "Tartu", lv: "Tartu" },
  { ee: "Narva", ru: "Нарва", en: "Narva", lt: "Narva", lv: "Narva" },
  { ee: "Pärnu", ru: "Пярну", en: "Pärnu", lt: "Pärnu", lv: "Pērnava" },
  {
    ee: "Kohtla-Järve",
    ru: "Кохтла-Ярве",
    en: "Kohtla-Järve",
    lt: "Kohtla-Järve",
    lv: "Kohtla-Järve",
  },
  {
    ee: "Viljandi",
    ru: "Вильянди",
    en: "Viljandi",
    lt: "Viljandi",
    lv: "Viljandi",
  },
  { ee: "Maardu", ru: "Маарду", en: "Maardu", lt: "Maardu", lv: "Maardu" },
  { ee: "Rakvere", ru: "Раквере", en: "Rakvere", lt: "Rakvere", lv: "Rakvere" },
  {
    ee: "Sillamäe",
    ru: "Силламяэ",
    en: "Sillamäe",
    lt: "Sillamäe",
    lv: "Sillamäe",
  },
  {
    ee: "Kuressaare",
    ru: "Курессааре",
    en: "Kuressaare",
    lt: "Kuressaare",
    lv: "Kuressaare",
  },
  { ee: "Võru", ru: "Выру", en: "Võru", lt: "Võru", lv: "Võru" },
  { ee: "Valga", ru: "Валга", en: "Valga", lt: "Valga", lv: "Valka" },
  {
    ee: "Haapsalu",
    ru: "Хаапсалу",
    en: "Haapsalu",
    lt: "Haapsalu",
    lv: "Haapsalu",
  },
  { ee: "Jõhvi", ru: "Йыхви", en: "Jõhvi", lt: "Jõhvi", lv: "Jõhvi" },
  { ee: "Paide", ru: "Пайде", en: "Paide", lt: "Paide", lv: "Paide" },
  { ee: "Keila", ru: "Кейла", en: "Keila", lt: "Keila", lv: "Keila" },
  { ee: "Kiviõli", ru: "Кивиыли", en: "Kiviõli", lt: "Kiviõli", lv: "Kiviõli" },
  { ee: "Tapa", ru: "Тапа", en: "Tapa", lt: "Tapa", lv: "Tapa" },
  { ee: "Põlva", ru: "Пылва", en: "Põlva", lt: "Põlva", lv: "Põlva" },
  { ee: "Jõgeva", ru: "Йыгева", en: "Jõgeva", lt: "Jõgeva", lv: "Jõgeva" },
  { ee: "Türi", ru: "Тюри", en: "Türi", lt: "Türi", lv: "Türi" },
  { ee: "Elva", ru: "Эльва", en: "Elva", lt: "Elva", lv: "Elva" },
  { ee: "Rapla", ru: "Рапла", en: "Rapla", lt: "Rapla", lv: "Rapla" },
  { ee: "Saue", ru: "Сауэ", en: "Saue", lt: "Saue", lv: "Saue" },
  {
    ee: "Põltsamaa",
    ru: "Пыльтсамаа",
    en: "Põltsamaa",
    lt: "Põltsamaa",
    lv: "Põltsamaa",
  },
  {
    ee: "Pärnu-Jaagupi",
    ru: "Пярну-Яагупи",
    en: "Pärnu-Jaagupi",
    lt: "Pärnu-Jaagupi",
    lv: "Pērnava-Jāgupi",
  },
  { ee: "Sindi", ru: "Синди", en: "Sindi", lt: "Sindi", lv: "Sindi" },
  { ee: "Kärdla", ru: "Кярдла", en: "Kärdla", lt: "Kärdla", lv: "Kärdla" },
  { ee: "Kunda", ru: "Кунда", en: "Kunda", lt: "Kunda", lv: "Kunda" },
  { ee: "Lihula", ru: "Лихула", en: "Lihula", lt: "Lihula", lv: "Lihula" },
];

const seedData = countryDetails.LT;
const seedCity = lithuanianCities || [];

const seed = async () => {
  const promises = seedCity.map((city) => {
    // combine country details with city
    const postData = {
      ...seedData,
      city,
    };

    const JWT_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJpYXQiOjE2ODk5NDcwMzIsImV4cCI6MTY5MjUzOTAzMiwiYXVkIjoiaHR0cHM6Ly80YXV0by5lZSIsImlzcyI6IjRhdXRvIiwic3ViIjoiNjQ4ZjUyYjdiNDc5N2IyZDBkYjc4YmFjIiwianRpIjoiZTA3Y2RlZDktYTJmMy00YTM1LThiYzQtNmQxODQ1Y2E3NWM4In0.3Ht-zTIKdIl7urh_dMu9nyzHUa-ifHzoJtwgyhV-OY4";

    // make a POST request
    return axios({
      method: "post",
      url: "https://backend.4auto.ee/locations",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      data: postData,
    });
  });

  try {
    const responses = await Promise.all(promises);
    // log response for each post request
    responses.forEach((res) => console.log(res.data));
  } catch (error) {
    console.error(error);
  }
};

seed();
