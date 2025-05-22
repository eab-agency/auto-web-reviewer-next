// Check if form ID within #apply-form contains 'paidsearch'
const checkPSFormId = async (page, link) => {
  console.log("\n### PS Form ID Check");
  console.log(`Checking page: ${link}`);

  let psFormIdOutput = "";

  const formIds = await page.$$eval("#apply-form form", (forms) =>
    forms.map((form) => form.id)
  );

  if (formIds.length === 0) {
    psFormIdOutput += `❌ No apply form found on page.\n`;
  } else {
    const hasPaidSearch = formIds.some((id) =>
      id.toLowerCase().includes("paidsearch")
    );

    if (hasPaidSearch) {
      psFormIdOutput += `✅ Correct apply form used.\n`;
    } else {
      psFormIdOutput += `❌ Make sure you are using the paidsearch apply form.\n`;
    }
  }

  console.log(psFormIdOutput);
  return psFormIdOutput;
};

module.exports = { checkPSFormId };
