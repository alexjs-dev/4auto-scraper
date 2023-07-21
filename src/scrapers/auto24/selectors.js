const selectors = {
  vehicleTypeSelector:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-liik > td.field",
  bodyType:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-keretyyp > td.field",
  engine:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-mootorvoimsus > td.field",
  fuel: "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-kytus > td.field",
  mileage:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-labisoit > td.field > span.value",
  driveTrain:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-vedavsild > td.field",
  transmission:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-kaigukast_kaikudega > td.field",
  regDate:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-month_and_year > td.field > span",
  price:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-hind > td.field > span.value",
  priceDiscounted:
    "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-soodushind > td.field > span.value",
  mainImage: "#lightgallery > div.vImages__first > a",
  galleryImages: "#lightgallery > div.vImages__other",
  vehicleMake: "body > div.b-breadcrumbs > a:nth-child(3)",
  vehicleModel: "body > div.b-breadcrumbs > a:nth-child(5)",
  originalTitle: "body > div.tpl-body > div.tpl-content > h1",
  description:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.other-info > div.-user_other",
  techData:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vTechData.-has-more > div.vFlexColumns > div.tech-data.col-1",
  meta1:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vEquipment.-has-more > div.vFlexColumns > div.equipment.col-1",
  meta2:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vEquipment.-has-more > div.vFlexColumns > div.equipment.col-2",
  citySelector:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.other-info > div.-location > b",
  locationSelector:
    "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.other-info > div.-location",
  nextPage:
    "body > div.tpl-body > div.tpl-content.have-sidebar > div.paginator.in-footer.pc-wide > div.next-page > a",
  nextPage2:
    "body > div.tpl-body > div.tpl-content.have-sidebar > div.paginator.in-footer > div.next-page > a",
};

module.exports = selectors;
