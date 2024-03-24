/*
 * controller.js
 *
 * Write all your code here.
 */
console.log("Hello, World!");

function validateField(field, pattern, errorMessage, notificationSelector) {
  const isValid = pattern.test($(field).val());
  displayValidationResult(field, isValid, errorMessage, notificationSelector);
}

function displayValidationResult(
  field,
  isValid,
  errorMessage,
  notificationSelector
) {
  if (!isValid) {
    $(field).css("background-color", "red");
    $(notificationSelector).text(errorMessage).show();
  } else {
    clearValidation(field, notificationSelector);
  }
}

function clearValidation(field, notificationSelector) {
  $(field).css("background-color", "");
  $(notificationSelector).text("").hide();
}

// Part 1: user registration form
$(function () {
  $("#username").on("input", function () {
    const usernamePattern = /^[a-zA-Z0-9_]{6,}$/;
    validateField(
      this,
      usernamePattern,
      "Username is invalid",
      "#username_notification"
    );
  });

  $("#password1").on("input", function () {
    const passwordPattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    validateField(
      this,
      passwordPattern,
      "Password is invalid",
      "#password1_notification"
    );
    // Trigger validation for repeat password
    $("#password2").trigger("input");
  });

  $("#password2").on("input", function () {
    const password1 = $("#password1").val();
    const password2 = $(this).val();
    const isValid = password1 === password2;
    displayValidationResult(
      this,
      isValid,
      "Passwords don't match",
      "#password2_notification"
    );
  });

  $("#email").on("input", function () {
    if ($(this).val() !== "") {
      // This pattern checks for:
      // 1. No consecutive dots in the local part.
      // 2. No underscores in the domain part.
      // 3. A valid structure of an email address.
      const emailPattern = /^(?!.*\.\.)[^\s@]+@(?![^\s@]*_)[^\s@]+\.[^\s@]+$/;
      validateField(
        this,
        emailPattern,
        "Email is invalid",
        "#email_notification"
      );
    } else {
      clearValidation(this, "#email_notification");
    }
  });

  $("#phone").on("input", function () {
    if ($(this).val() !== "") {
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
      validateField(
        this,
        phonePattern,
        "Phone is invalid",
        "#phone_notification"
      );
    } else {
      clearValidation(this, "#phone_notification");
    }
  });

  $("#register").on("click", function (event) {
    console.log("Register button clicked");
    event.preventDefault();
    // Trigger validation for all fields
    $("#username, #password1, #password2, #email, #phone").trigger("input");

    // Manually check each notification element for visibility
    var invalidFields = [
      "#username_notification",
      "#password1_notification",
      "#password2_notification",
      "#email_notification",
      "#phone_notification",
    ].filter(function (id) {
      return $(id).is(":visible");
    });

    // Check if any field is invalid
    if (invalidFields.length > 0) {
      console.log("At least one field is invalid");
      $("#notification").text(
        "At least one field is invalid. Please correct it before proceeding."
      );
    } else {
      // Prepare data
      const data = {
        username: $("#username").val(),
        password1: $("#password1").val(),
        password2: $("#password2").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
      };
      // Send AJAX request
      $.ajax({
        url: "/register",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
          $("#notification").text("User added").css("color", "green").show();
        },
        error: function (xhr) {
          if (xhr.status === 409) {
            $("#username_notification")
              .text("Username has already been taken")
              .show();
          } else {
            $("#notification")
              .text("Unknown error occurred")
              .css("color", "red")
              .show();
          }
        },
      });
    }
  });
});

// Part 2: shopping cart
var cart = [];

$(function () {
  $("#add_update_item").click(function () {
    var name = $("#name").val().trim().replace(/\s+/g, "_");
    var price = parseFloat($("#price").val());
    var quantity = parseInt($("#quantity").val());

    // Validation
    if (!name || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      $("#item_notification")
        .text("Name, price, or quantity is invalid")
        .show();
      return;
    } else {
      $("#item_notification").text("").hide();
    }

    // Find item in cart
    var item = cart.find((item) => item.name === name);

    if (item) {
      // Update existing item
      item.price = price;
      item.quantity = quantity;
      item.total = price * quantity;
    } else {
      // Add new item
      cart.push(new Item(name, price, quantity));
    }

    updateCartUI();
    clearFields();
  });

  function updateCartUI() {
    var subtotal = 0;
    $("#cart-items tbody").empty();

    cart.forEach(function (item) {
      subtotal += item.total;
      var row = `<tr id="${item.name}">
                <td>${item.name.replace(/_/g, " ")}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${item.total.toFixed(2)}</td>
                <td> <button id="decrease" class="btn decrease"> - </button> </td>
                <td> <button id="increase" class="btn increase"> + </button> </td>
                <td> <button id="delete" class="btn delete"> delete </button> </td>
            </tr>`;
      $("#cart-items tbody").append(row);
    });

    var taxes = subtotal * 0.13;
    var grandTotal = subtotal + taxes;

    $("#subtotal").text(subtotal.toFixed(2));
    $("#taxes").text(taxes.toFixed(2));
    $("#grand_total").text(grandTotal.toFixed(2));
  }

  function clearFields() {
    $("#name").val("");
    $("#price").val("");
    $("#quantity").val("");
  }

  $("#cart-items").on("click", "#increase", function () {
    var itemName = $(this).closest("tr").attr("id");
    var item = cart.find((item) => item.name === itemName);
    if (item) {
      item.quantity++;
      item.total = item.price * item.quantity;
      updateCartUI();
    }
  });

  $("#cart-items").on("click", "#decrease", function () {
    var itemName = $(this).closest("tr").attr("id");
    var item = cart.find((item) => item.name === itemName);
    if (item && item.quantity > 0) {
      item.quantity--;
      item.total = item.price * item.quantity;
      updateCartUI();
    }
  });

  $("#cart-items").on("click", "#delete", function () {
    var itemName = $(this).closest("tr").attr("id");
    cart = cart.filter((item) => item.name !== itemName);
    updateCartUI();
  });
});

// Part 3: Doom scrolling
const NUM_PARAGRAPH_PER_REQUEST = 5;
$(document).ready(function () {
  var nextParagraph = 1;
  var hasMore = true;

  // Fetch and render paragraphs when the document is ready
  fetchAndRenderParagraphs();

  // Fetch and render paragraphs when scrolling to the bottom of the page
  $(window).scroll(function () {
    if (isUserAtBottomOfPage()) {
      fetchAndRenderParagraphs();
    }
  });

  function fetchAndRenderParagraphs() {
    if (!hasMore) return;

    $.ajax({
      url: "/text/data?paragraph=" + nextParagraph,
      method: "GET",
      success: handleFetchSuccess,
    });
  }

  function handleFetchSuccess(response) {
    response.data.forEach(renderParagraph);
    updateFetchState(response.next);
  }

  function renderParagraph(paragraph) {
    var paragraphDiv = createParagraphDiv(paragraph);
    $("#data").append(paragraphDiv);
  }

  function createParagraphDiv(paragraph) {
    var paragraphDiv = $("<div>", { id: "paragraph_" + paragraph.paragraph });
    paragraphDiv.append($("<p>").text(paragraph.content));
    paragraphDiv.append(
      $("<b>").text("(Paragraph: " + paragraph.paragraph + ")")
    );
    paragraphDiv.append(createLikeButton(paragraph));
    return paragraphDiv;
  }

  function createLikeButton(paragraph) {
    var likeButton = $("<button>", { class: "like" }).text(
      "Likes: " + paragraph.likes
    );
    likeButton.click(function () {
      updateLikes(paragraph.paragraph, likeButton);
    });
    return likeButton;
  }

  function updateLikes(paragraphNumber, likeButton) {
    $.ajax({
      url: "/text/like",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ paragraph: paragraphNumber }),
      success: function (response) {
        likeButton.text(response.data.likes + " Likes");
      },
    });
  }

  function updateFetchState(hasNext) {
    if (!hasNext) {
      $("#data").append($("<b>").text("You have reached the end."));
      hasMore = false;
    } else {
      nextParagraph += NUM_PARAGRAPH_PER_REQUEST;
    }
  }

  function isUserAtBottomOfPage() {
    return (
      $(window).scrollTop() + $(window).height() >= $(document).height() - 10
    );
  }
});
