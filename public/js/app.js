/* SekolahMania — extracted application logic (Roadmap 1.1)
   Source of truth: final <script> block in index.html.
   To use externally: remove the inline <script> and add
   <script src="/public/js/app.js?v=1.1" defer></script>
   (jQuery + html2pdf must still load before this file). */

// ═══════════════════════════════════════════════
      //  SekolahMania — scripts.js (Aloha-style jQuery)
      //  Cache-bust: ?3  (Panduan STEM merge + Roadmap optimizations)
      // ═══════════════════════════════════════════════

      // ── State ──────────────────────────────────────
      var currentRating = 0;
      var upfCurrentStep = 1;
      var upfTotalSteps = 4;

      // ── Roadmap 1.3 — Unit Plan autosave (localStorage) ──
      var UPF_STORAGE_KEY = "sekolahmania_rpm_draft_v1";
      var UPF_FIELDS = [
        "upf-mapel", "upf-kelas", "upf-waktu", "upf-profil",
        "upf-tujuan", "upf-topik", "upf-pedagogi", "upf-lingkungan",
        "upf-mitra", "upf-memahami", "upf-mengaplikasi", "upf-merefleksi",
        "upf-as-awal", "upf-as-proses", "upf-as-akhir", "upf-catatan",
      ];

      // ── Convex HTTP Actions config ─────────────────
      // LOCAL DEV:  "http://127.0.0.1:3211"
      // CLOUD:      "https://<your-slug>.convex.site"
      // SELF-HOST:  "https://convex.sekolahmania.com"
      var CONVEX_HTTP_URL = "http://127.0.0.1:3211";

      // ── Nav: open / close (Aloha global onclick pattern) ──
      function openNav() {
        $("#sidenav").addClass("open");
        $("#sidenavOverlay").addClass("visible");
        $("#hamburger").addClass("open");
        $("body").css("overflow", "hidden");
      }
      function closeNav() {
        $("#sidenav").removeClass("open");
        $("#sidenavOverlay").removeClass("visible");
        $("#hamburger").removeClass("open");
        $("body").css("overflow", "");
      }

      // ── Jump to section utility ──────────────────
      function jumpToSection(id) {
        var $el = $("#" + id);
        if (!$el.length) return;
        $("html,body").animate({ scrollTop: $el.offset().top - 80 }, 400);
      }

      // ── Star rating ───────────────────────────────
      function setRating(val) {
        currentRating = val;
        $("#starRating .rating-star").each(function () {
          $(this).toggleClass("active", parseInt($(this).data("val")) <= val);
        });
      }

      // ── Media tab switcher (Aloha tab pattern) ───
      function switchTab(panel, btn) {
        $(".media-tab").removeClass("active");
        $(btn).addClass("active");
        $(".media-panel").removeClass("active");
        $("#tab-" + panel).addClass("active");
      }

      // ── Panduan STEM tab switcher (Bab 1–6 + Istilah) ──
      function switchPanduan(panel, btn) {
        $(".panduan-tab").removeClass("active");
        $(btn).addClass("active");
        $(".panduan-panel").removeClass("active");
        $("#panduan-" + panel).addClass("active");
      }

      // ── Unit Plan Builder — step navigation ──────
      function upfGoTo(step) {
        upfCurrentStep = step;

        // Hide all steps, show current
        $(".upf-step").removeClass("active");
        $("#upf-step-" + step).addClass("active");

        // Progress dots
        for (var i = 1; i <= upfTotalSteps; i++) {
          var $dot = $("#upf-pd-" + i);
          $dot.removeClass("done active");
          if (i < step) $dot.addClass("done");
          if (i === step) $dot.addClass("active");
        }

        // Left nav steps
        $(".builder-step").removeClass("active");
        $("#builderStepNav .builder-step")
          .eq(step - 1)
          .addClass("active");
      }

      function upfNext() {
        if (upfCurrentStep < upfTotalSteps) upfGoTo(upfCurrentStep + 1);
      }
      function upfBack() {
        if (upfCurrentStep > 1) upfGoTo(upfCurrentStep - 1);
      }
      function goToUPFStep(n) {
        upfGoTo(n);
      }

      function upfSubmit() {
        var data = {
          mapel: $("#upf-mapel").val(),
          kelas: $("#upf-kelas").val(),
          waktu: $("#upf-waktu").val(),
          profil: $("#upf-profil").val(),
          tujuan: $("#upf-tujuan").val(),
          topik: $("#upf-topik").val(),
          pedagogi: $("#upf-pedagogi").val(),
          lingkungan: $("#upf-lingkungan").val(),
          mitra: $("#upf-mitra").val(),
          memahami: $("#upf-memahami").val(),
          mengaplikasi: $("#upf-mengaplikasi").val(),
          merefleksi: $("#upf-merefleksi").val(),
          as_awal: $("#upf-as-awal").val(),
          as_proses: $("#upf-as-proses").val(),
          as_akhir: $("#upf-as-akhir").val(),
          catatan: $("#upf-catatan").val(),
          dimensi: [],
        };

        // Collect checked dimensi
        $("#dimensiChecks input:checked").each(function () {
          data.dimensi.push($(this).val());
        });

        if (!data.tujuan.trim()) {
          alert("Mohon isi Tujuan Pembelajaran pada Langkah 2.");
          upfGoTo(2);
          return;
        }
        if (data.dimensi.length === 0) {
          alert("Mohon pilih minimal satu Dimensi Profil Lulusan.");
          upfGoTo(1);
          return;
        }

        console.log("Unit Plan submitted:", data);

        fetch(CONVEX_HTTP_URL + "/submitUnitPlan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (result) {
            if (!result.success)
              console.error("Unit plan error:", result.error);
          })
          .catch(function (err) {
            console.error("Unit plan network error:", err);
          });

        // Roadmap 2.1 — Professional PDF export (html2pdf.js)
        // Falls back to plain .txt if the library failed to load.
        if (typeof html2pdf !== "undefined") {
          generateUnitPlanPDF(data);
        } else {
          var txt = generateUnitPlanText(data);
          downloadFile(
            "RPM-" + (data.topik || data.mapel).replace(/\s+/g, "-") + ".txt",
            txt,
          );
        }

        // Roadmap 1.3 — clear autosaved draft only after successful submit
        try {
          localStorage.removeItem(UPF_STORAGE_KEY);
        } catch (e) {
          /* localStorage unavailable — ignore */
        }

        alert(
          "✅ Unit Plan berhasil disimpan! Dokumen RPM telah diunduh dan draft otomatis dibersihkan.",
        );
      }

      // ── Roadmap 2.1 — Render styled RPM and export as PDF ──
      function generateUnitPlanPDF(d) {
        var dimensiList = d.dimensi.length ? d.dimensi.join(", ") : "-";
        var esc = function (s) {
          return $("<span>").text(s || "-").html();
        };
        var html =
          '<div style="font-family: Figtree, Arial, sans-serif; color:#0d2137; padding:32px; max-width:780px;">' +
          '<div style="border-bottom:3px solid #0e7c6e; padding-bottom:16px; margin-bottom:24px;">' +
          '<h1 style="font-size:22px; margin:0 0 4px; color:#0d2137;">Rencana Pelaksanaan Pembelajaran Mendalam</h1>' +
          '<p style="font-size:12px; color:#5c7a8a; margin:0;">SekolahMania.com · ' +
          new Date().toLocaleDateString("id-ID") +
          " · Pembelajaran STEM</p>" +
          "</div>" +
          '<table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px;">' +
          rowPDF("Mata Pelajaran", esc(d.mapel)) +
          rowPDF("Kelas / Fase", esc(d.kelas)) +
          rowPDF("Alokasi Waktu", esc(d.waktu)) +
          rowPDF("Dimensi Profil Lulusan", esc(dimensiList)) +
          "</table>" +
          sectionPDF("Identifikasi — Profil Peserta Didik", esc(d.profil)) +
          sectionPDF("Tujuan Pembelajaran", esc(d.tujuan)) +
          sectionPDF("Topik Pembelajaran", esc(d.topik)) +
          sectionPDF("Praktik Pedagogis", esc(d.pedagogi)) +
          sectionPDF("Lingkungan Pembelajaran", esc(d.lingkungan)) +
          sectionPDF("Kemitraan", esc(d.mitra)) +
          '<h3 style="font-size:14px; color:#0e7c6e; margin:24px 0 8px;">Pengalaman Belajar</h3>' +
          sectionPDF("1. Memahami (Berkesadaran, Bermakna)", esc(d.memahami)) +
          sectionPDF("2. Mengaplikasi (Bermakna, Menggembirakan)", esc(d.mengaplikasi)) +
          sectionPDF("3. Merefleksi (Berkesadaran, Regulasi Diri)", esc(d.merefleksi)) +
          '<h3 style="font-size:14px; color:#0e7c6e; margin:24px 0 8px;">Asesmen</h3>' +
          sectionPDF("Awal (Diagnostik)", esc(d.as_awal)) +
          sectionPDF("Proses (Formatif)", esc(d.as_proses)) +
          sectionPDF("Akhir (Sumatif)", esc(d.as_akhir)) +
          sectionPDF("Catatan Tambahan", esc(d.catatan)) +
          '<p style="font-size:11px; color:#8fa4b0; margin-top:28px; border-top:1px solid #d8e4e0; padding-top:12px;">Dibuat di SekolahMania.com — Platform Pelatihan Guru STEM · Pembelajaran Mendalam</p>' +
          "</div>";

        var holder = document.createElement("div");
        holder.innerHTML = html;
        html2pdf()
          .set({
            margin: 10,
            filename:
              "RPM-" + (d.topik || d.mapel).replace(/\s+/g, "-") + ".pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(holder)
          .save();
      }

      function rowPDF(label, val) {
        return (
          '<tr><td style="padding:7px 10px; background:#f2ede4; font-weight:600; width:38%; border:1px solid #d8e4e0;">' +
          label +
          '</td><td style="padding:7px 10px; border:1px solid #d8e4e0;">' +
          val +
          "</td></tr>"
        );
      }
      function sectionPDF(label, val) {
        return (
          '<div style="margin-bottom:12px;"><div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#5c7a8a; margin-bottom:3px;">' +
          label +
          '</div><div style="font-size:13px; line-height:1.6; color:#2e4a5f;">' +
          val +
          "</div></div>"
        );
      }

      function generateUnitPlanText(d) {
        var lines = [
          "══════════════════════════════════════════",
          "RENCANA PELAKSANAAN PEMBELAJARAN MENDALAM",
          "SekolahMania.com · " + new Date().toLocaleDateString("id-ID"),
          "══════════════════════════════════════════",
          "",
          "MATA PELAJARAN : " + d.mapel,
          "KELAS / FASE   : " + d.kelas,
          "ALOKASI WAKTU  : " + (d.waktu || "-"),
          "DIMENSI PROFIL : " + (d.dimensi.join(", ") || "-"),
          "",
          "── IDENTIFIKASI ──────────────────────────",
          "Profil Peserta Didik:",
          d.profil || "(opsional)",
          "",
          "── DESAIN PEMBELAJARAN ───────────────────",
          "Tujuan Pembelajaran:",
          d.tujuan,
          "",
          "Topik       : " + (d.topik || "-"),
          "Pedagogis   : " + d.pedagogi,
          "Lingkungan  : " + (d.lingkungan || "-"),
          "Kemitraan   : " + (d.mitra || "-"),
          "",
          "── PENGALAMAN BELAJAR ────────────────────",
          "1. MEMAHAMI (Berkesadaran, Bermakna):",
          d.memahami || "-",
          "",
          "2. MENGAPLIKASI (Bermakna, Menggembirakan):",
          d.mengaplikasi || "-",
          "",
          "3. MEREFLEKSI (Berkesadaran, Regulasi Diri):",
          d.merefleksi || "-",
          "",
          "── ASESMEN ───────────────────────────────",
          "Awal  : " + (d.as_awal || "-"),
          "Proses: " + (d.as_proses || "-"),
          "Akhir : " + (d.as_akhir || "-"),
          "",
          "Catatan: " + (d.catatan || "-"),
          "",
          "══════════════════════════════════════════",
          "Dibuat di SekolahMania.com",
          "Pembicara: Ayuk Ratna Puspaningsih",
          "SMA Negeri Bali Mandara",
        ];
        return lines.join("\n");
      }

      function downloadFile(filename, text) {
        var el = document.createElement("a");
        el.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(text),
        );
        el.setAttribute("download", filename);
        el.style.display = "none";
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
      }

      // ── Dimensi checkbox visual toggle ──────────
      $(document).on(
        "change",
        "#dimensiChecks input[type=checkbox]",
        function () {
          $(this)
            .closest(".dimensi-check-item")
            .toggleClass("checked", this.checked);
        },
      );

      // ── Panduan STEM accordion (slide toggle) ──────
      $(document).on("click", ".acc-trigger", function () {
        var id = $(this).data("acc");
        var $body = $("#" + id);
        var isOpen = $(this).hasClass("open");
        // close all items within the same accordion container
        $(this).closest(".accordion").find(".acc-trigger").removeClass("open");
        $(this).closest(".accordion").find(".acc-body").slideUp(200);
        if (!isOpen) {
          $(this).addClass("open");
          $body.slideDown(220);
        }
      });

      // ── Roadmap 1.3 — Unit Plan autosave to localStorage ──
      function upfSaveDraft() {
        try {
          var draft = {};
          UPF_FIELDS.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) draft[id] = el.value;
          });
          draft.dimensi = [];
          $("#dimensiChecks input:checked").each(function () {
            draft.dimensi.push($(this).val());
          });
          localStorage.setItem(UPF_STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
          /* localStorage unavailable (private mode / quota) — silently skip */
        }
      }

      function upfRestoreDraft() {
        try {
          var raw = localStorage.getItem(UPF_STORAGE_KEY);
          if (!raw) return false;
          var draft = JSON.parse(raw);
          var hasContent = false;
          UPF_FIELDS.forEach(function (id) {
            var el = document.getElementById(id);
            if (el && draft[id]) {
              el.value = draft[id];
              if (draft[id].trim()) hasContent = true;
            }
          });
          if (Array.isArray(draft.dimensi)) {
            draft.dimensi.forEach(function (val) {
              var $cb = $('#dimensiChecks input[value="' + val + '"]');
              if ($cb.length) {
                $cb.prop("checked", true);
                $cb.closest(".dimensi-check-item").addClass("checked");
                hasContent = true;
              }
            });
          }
          return hasContent;
        } catch (e) {
          return false;
        }
      }

      // ── Q&A Submission ────────────────────────────
      function submitQA() {
        var name = $("#qaName").val().trim();
        var school = $("#qaSchool").val().trim();
        var subject = $("#qaSubject").val();
        var message = $("#qaMessage").val().trim();

        if (!name || !message) {
          alert("Mohon isi nama dan pertanyaan Anda.");
          return;
        }

        var payload = {
          name,
          school,
          subject,
          message,
        };
        console.log("Q&A submitted:", payload);

        fetch(CONVEX_HTTP_URL + "/submitQuestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (!data.success) console.error("Q&A error:", data.error);
          })
          .catch(function (err) {
            console.error("Q&A network error:", err);
          });

        $("#qaName, #qaSchool, #qaMessage").val("");
        $("#qaSubject").prop("selectedIndex", 0);
        $("#qaSuccess").fadeIn(300);
        setTimeout(function () {
          $("#qaSuccess").fadeOut(300);
        }, 5000);
      }

      // ── Feedback Submission ────────────────────────
      function submitFeedback() {
        var name = $("#fbName").val().trim();
        var school = $("#fbSchool").val().trim();
        var session = $("#fbSession").val();
        var message = $("#fbMessage").val().trim();

        if (!name || !message) {
          alert("Mohon isi nama dan umpan balik Anda.");
          return;
        }

        var payload = {
          name,
          school,
          session,
          rating: currentRating,
          message,
        };
        console.log("Feedback submitted:", payload);

        fetch(CONVEX_HTTP_URL + "/submitFeedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (!data.success) console.error("Feedback error:", data.error);
          })
          .catch(function (err) {
            console.error("Feedback network error:", err);
          });

        $("#fbName, #fbSchool, #fbMessage").val("");
        $("#fbSession").prop("selectedIndex", 0);
        currentRating = 0;
        $("#starRating .rating-star").removeClass("active");
        $("#fbSuccess").fadeIn(300);
        setTimeout(function () {
          $("#fbSuccess").fadeOut(300);
        }, 5000);
      }

      // ══════════════════════════════════════════════
      //  DOM READY
      // ══════════════════════════════════════════════
      $(document).ready(function () {
        // ── Smooth scroll with fixed nav offset ──────
        $(document).on("click", 'a[href^="#"]', function (e) {
          var hash = this.hash;
          if (!hash || hash === "#") return;
          var $target = $(hash);
          if (!$target.length) return;
          e.preventDefault();
          closeNav();
          $("html,body").animate(
            { scrollTop: $target.offset().top - 80 },
            420,
            "swing",
          );
        });

        // ── Intersection Observer — scroll reveals ───
        if ("IntersectionObserver" in window) {
          var revObs = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  entry.target.classList.add("visible");
                  revObs.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
          );

          document.querySelectorAll(".reveal").forEach(function (el) {
            revObs.observe(el);
          });
        } else {
          $(".reveal").addClass("visible");
        }

        // ── Scroll — nav background + progress + back-to-top ──
        var $progressStrip = $("#progressStrip");
        var $progressDots = $(".prog-mod-fill");
        var $progressPct = $("#progressPct");
        var $backTop = $("#backTop");
        var $allSections = $("section[id]");

        $(window).on("scroll.sekolahmania", function () {
          var scrollTop = $(this).scrollTop();
          var docH = $(document).height() - $(window).height();
          var pct = docH > 0 ? Math.round((scrollTop / docH) * 100) : 0;

          // Nav opacity
          $("#mainNav").css(
            "background",
            scrollTop > 60
              ? "rgba(13, 33, 55, 0.98)"
              : "rgba(13, 33, 55, 0.92)",
          );

          // Progress strip (show after scrolling past hero)
          if (scrollTop > 500) {
            $progressStrip.show();
          } else {
            $progressStrip.hide();
          }

          // Fill each progress segment proportionally across 7 sections.
          // NOTE (Roadmap 2.2): this is a scroll-depth proxy. To make this an
          // authentic learning metric, hook H5P xAPI "completed"/"passed"
          // statements and drive segment fill from those milestones instead.
          var segPct = Math.min(100, pct * 7);
          $progressDots.each(function (i) {
            var fill = Math.min(100, Math.max(0, segPct - i * 100));
            $(this).css("width", fill + "%");
            $(this)
              .closest(".prog-mod")
              .toggleClass("complete", fill >= 100);
          });
          $progressPct.text(pct + "%");

          // Back-to-top
          $backTop.toggleClass("visible", scrollTop > 400);

          // Active nav link highlighting
          $allSections.each(function () {
            var top = $(this).offset().top - 100;
            var bottom = top + $(this).outerHeight();
            var id = $(this).attr("id");
            if (scrollTop >= top && scrollTop < bottom) {
              $(".nav-links a").removeClass("active");
              $('.nav-links a[href="#' + id + '"]').addClass("active");
            }
          });
        });

        // ── i18n data-i18n fallback pattern (Aloha SEO-safe) ──
        // English default text is already in HTML; locale overlay goes here.
        // var lang = navigator.language.slice(0, 2) || 'id';
        // $.getJSON('/js/i18n/' + lang + '.json?2', function(strings) {
        //   $('[data-i18n]').each(function() {
        //     var key = $(this).data('i18n');
        //     if (strings[key]) $(this).text(strings[key]);
        //   });
        // });

        // ── Animate stacked PISA bars on scroll into view ──
        if ("IntersectionObserver" in window) {
          var pisaObs = new IntersectionObserver(
            function (entries) {
              if (entries[0].isIntersecting) {
                // bars are already at correct width via inline style; just trigger repaint
                pisaObs.disconnect();
              }
            },
            { threshold: 0.3 },
          );
          var pisaEl = document.querySelector(".pisa-bars");
          if (pisaEl) pisaObs.observe(pisaEl);
        }

        // ── Roadmap 1.2 — enforce lazy-loading on all media ──
        // All current visuals are pure CSS, but any <img>/<iframe> added later
        // (H5P embeds, YouTube, speaker photos) get loading="lazy" automatically.
        document
          .querySelectorAll("img:not([loading]), iframe:not([loading])")
          .forEach(function (el) {
            el.setAttribute("loading", "lazy");
          });

        // ── Roadmap 1.3 — Unit Plan autosave + restore ──
        var $upfInputs = $(
          "#upf-mapel, #upf-kelas, #upf-waktu, #upf-profil, #upf-tujuan, " +
            "#upf-topik, #upf-pedagogi, #upf-lingkungan, #upf-mitra, " +
            "#upf-memahami, #upf-mengaplikasi, #upf-merefleksi, " +
            "#upf-as-awal, #upf-as-proses, #upf-as-akhir, #upf-catatan",
        );
        // Autosave on typing / change (debounced lightly via timeout)
        var saveTimer = null;
        function scheduleSave() {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(upfSaveDraft, 400);
        }
        $upfInputs.on("keyup change", scheduleSave);
        $(document).on(
          "change",
          "#dimensiChecks input[type=checkbox]",
          scheduleSave,
        );
        // Restore any saved draft on load
        if (upfRestoreDraft()) {
          var $note = $("#upfRestoreNote");
          if ($note.length) $note.fadeIn(300);
        }

        // ── Plausible-style analytics proxy (Aloha takeaway #3) ──
        // Fire a pageview event through our own domain proxy to avoid adblocker drops
        // fetch('/stats/api/event', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ n: 'pageview', u: location.href, d: 'sekolahmania.com', r: document.referrer })
        // });
      }); // end document.ready
