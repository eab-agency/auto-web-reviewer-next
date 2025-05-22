async function checkUnsureDropdown(page, link) {
  console.log("\n### Unsure is last option in dropdown");
  console.log(`Checking page: ${link}`);

  // Check the "Intended Program" dropdown for specific fields (if visible)
  const isDropdownVisible = await page.evaluate(() => {
    const prgmField = document.querySelector(
      'form select[name="mauticform[c_prgm_intrst]"]'
    );
    const areaField = document.querySelector(
      'form select[name="mauticform[c_area_intrst]"]'
    );
    return {
      prgmFieldVisible: prgmField && prgmField.offsetParent !== null,
      areaFieldVisible: areaField && areaField.offsetParent !== null,
    };
  });

  if (
    isDropdownVisible.prgmFieldVisible ||
    isDropdownVisible.areaFieldVisible
  ) {
    const options = await page.evaluate(() => {
      const prgmOptions = Array.from(
        document.querySelectorAll(
          'form select[name="mauticform[c_prgm_intrst]"] option'
        )
      );
      const areaOptions = Array.from(
        document.querySelectorAll(
          'form select[name="mauticform[c_area_intrst]"] option'
        )
      );

      const getLocation = (el) => {
        const rect = el.getBoundingClientRect();
        return `x: ${rect.x}, y: ${rect.y}`;
      };

      return {
        prgmOptions: prgmOptions.map((option) => option.textContent.trim()),
        areaOptions: areaOptions.map((option) => option.textContent.trim()),
        locations: [...prgmOptions, ...areaOptions].map((option) =>
          getLocation(option)
        ),
      };
    });

    // Check if "unsure" is the last item
    const isLastUnsure =
      (options.prgmOptions.length > 0 &&
        options.prgmOptions[options.prgmOptions.length - 1].toLowerCase() ===
          "unsure") ||
      (options.areaOptions.length > 0 &&
        options.areaOptions[options.areaOptions.length - 1].toLowerCase() ===
          "unsure");

    let unsureOutput = "";

    if (isLastUnsure) {
      unsureOutput += `✅ "Unsure" is the last item in the dropdown.\n`;
    } else {
      unsureOutput += `❌ "Unsure" is NOT the last item.\n`;
      unsureOutput += `   Locations of dropdown options: ${options.locations.join(
        ", "
      )}\n`;
    }

    console.log(unsureOutput);
    return unsureOutput;
  }

  // Return an empty string if no dropdowns are visible
  const emptyResult = "No dropdowns found on this page.\n";
  console.log(emptyResult);
  return emptyResult;
}

module.exports = { checkUnsureDropdown };
