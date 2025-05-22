// Check DIQ hidden fields for correct term and year
const checkDIQHiddenFields = async (page, link) => {
  console.log("\n### DIQ Hidden Fields Check");
  console.log(`Checking page: ${link}`);

  const expectedTerm = process.env.DIQ_term;
  const expectedYear = process.env.DIQ_year;

  // Check if the page contains any <form> elements
  const hasForms = await page.evaluate(() => document.querySelector("form"));
  if (!hasForms) {
    const result =
      "ℹ️ No forms found on this page, skipping hidden field check.\n";
    console.log(result);
    return result;
  }

  // Extract hidden field values
  const { termValue, yearValue } = await page.evaluate(() => {
    const termField = document.querySelector(
      'input[name="mauticform[diq_entry_term]"]'
    );
    const yearField = document.querySelector(
      'input[name="mauticform[diq_entry_year]"]'
    );

    return {
      termValue: termField ? termField.value : null,
      yearValue: yearField ? yearField.value : null,
    };
  });

  let diqHiddenFieldsOutput = "";

  // Validate term
  if (termValue === expectedTerm) {
    diqHiddenFieldsOutput += `✅ Correct DIQ hidden field term found: ${termValue}.\n`;
  } else {
    diqHiddenFieldsOutput += `❌ Incorrect DIQ hidden field term. Expected: ${expectedTerm}, Found: ${
      termValue || "None"
    }.\n`;
  }

  // Validate year
  if (yearValue === expectedYear) {
    diqHiddenFieldsOutput += `✅ Correct DIQ hidden field year found: ${yearValue}.\n`;
  } else {
    diqHiddenFieldsOutput += `❌ Incorrect DIQ hidden field year. Expected: ${expectedYear}, Found: ${
      yearValue || "None"
    }.\n`;
  }

  console.log(diqHiddenFieldsOutput);
  return diqHiddenFieldsOutput;
};

module.exports = { checkDIQHiddenFields };
